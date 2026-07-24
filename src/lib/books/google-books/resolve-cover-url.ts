import { createHash } from "node:crypto";
import {
  getCoverUrlCandidates,
  getStableCoverUrl,
  isPlausibleBookCover,
  type CoverImageQuality,
} from "@/src/lib/books/google-books/to-high-quality-cover-url";

type ProbeResult = "ok" | "unavailable" | "error";

const probeCache = new Map<string, ProbeResult>();
const resolveCache = new Map<string, string | null>();

/**
 * SHA-256 digests of Google's static "image not available" PNGs (several sizes /
 * color types). Higher zoom levels often return these instead of a real cover.
 */
const GOOGLE_UNAVAILABLE_COVER_SHA256 = new Set([
  // 128×170 grayscale
  "e3f8c414b288cbdf4e6d1e00eb6d3826157d10a5b5628b9318f726ea490eca12",
  // 575×750 grayscale
  "3efa8c43e5b4348f303a528c81adf435f0111ea752fe9f0f6241478b60987fa6",
  // 300×391 truecolor ("image not available" text)
  "12557f8948b8bdc6af436e3a8b3adddd45f7f7d2b67c5832e799cdf4686f72bb",
  // 800×1200 truecolor variant
  "72c2ffbaccd2444186957aaa2f6fdc8d912e207cf242fb4858e29df66a60d0e4",
]);

function sha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/** Google's "image not available" art — known hashes or grayscale PNG/JPEG. */
export function isGoogleUnavailableCoverImage(bytes: Uint8Array): boolean {
  if (bytes.length < 10) {
    return false;
  }

  if (GOOGLE_UNAVAILABLE_COVER_SHA256.has(sha256Hex(bytes))) {
    return true;
  }

  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47;

  if (isPng && bytes.length >= 26) {
    // IHDR color type 0 = grayscale (common for smaller placeholders)
    // Color type 3 = indexed/palette — Google returns these for missing high
    // zooms (tiny PNGs at 300–800px) while zoom=1 still has a real JPEG cover.
    if (bytes[25] === 0 || bytes[25] === 3) {
      return true;
    }
  }

  const jpegComponents = readJpegComponentCount(bytes);
  // Real covers are color (3 components); grayscale JPEGs are placeholders.
  if (jpegComponents === 1) {
    return true;
  }

  return false;
}

function readPngSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 24) {
    return null;
  }

  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47;

  if (!isPng) {
    return null;
  }

  const width =
    (bytes[16]! << 24) | (bytes[17]! << 16) | (bytes[18]! << 8) | bytes[19]!;
  const height =
    (bytes[20]! << 24) | (bytes[21]! << 16) | (bytes[22]! << 8) | bytes[23]!;
  return { width, height };
}

function readJpegSof(
  bytes: Uint8Array,
): { width: number; height: number; components: number } | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return null;
  }

  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1]!;
    const size = (bytes[offset + 2]! << 8) | bytes[offset + 3]!;

    // SOF0 / SOF2
    if (marker === 0xc0 || marker === 0xc2) {
      const height = (bytes[offset + 5]! << 8) | bytes[offset + 6]!;
      const width = (bytes[offset + 7]! << 8) | bytes[offset + 8]!;
      const components = bytes[offset + 9]!;
      return { width, height, components };
    }

    if (size < 2) {
      break;
    }
    offset += 2 + size;
  }

  return null;
}

function readJpegComponentCount(bytes: Uint8Array): number | null {
  return readJpegSof(bytes)?.components ?? null;
}

export function readCoverImageSize(
  bytes: Uint8Array,
): { width: number; height: number } | null {
  const png = readPngSize(bytes);
  if (png) {
    return png;
  }

  const jpeg = readJpegSof(bytes);
  if (jpeg) {
    return { width: jpeg.width, height: jpeg.height };
  }

  return null;
}

async function probeCoverUrl(url: string): Promise<ProbeResult> {
  const cached = probeCache.get(url);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const response = await fetch(url, {
      // Full body for small placeholders so SHA-256 matches; enough for JPEG SOF.
      headers: { Range: "bytes=0-65535" },
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 86400 },
    });

    if (!response.ok && response.status !== 206) {
      // Transient upstream failure — do not cache; retry next time.
      return "error";
    }

    const bytes = new Uint8Array(await response.arrayBuffer());

    // Range responses are incomplete — hash only when we likely have the full file.
    const contentRange = response.headers.get("content-range");
    const fullLength = contentRange?.match(/\/(\d+)$/)?.[1];
    const haveFullFile =
      response.status === 200 ||
      (fullLength !== undefined && bytes.length >= Number(fullLength));

    if (haveFullFile && isGoogleUnavailableCoverImage(bytes)) {
      probeCache.set(url, "unavailable");
      return "unavailable";
    }

    // Partial JPEG: still reject grayscale when SOF is present.
    if (readJpegComponentCount(bytes) === 1) {
      probeCache.set(url, "unavailable");
      return "unavailable";
    }

    // Partial PNG: reject grayscale / indexed placeholder IHDR.
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes.length >= 26 &&
      (bytes[25] === 0 || bytes[25] === 3)
    ) {
      probeCache.set(url, "unavailable");
      return "unavailable";
    }

    const size = readCoverImageSize(bytes);
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
    if (!size && isJpeg) {
      probeCache.set(url, "ok");
      return "ok";
    }

    if (!size || !isPlausibleBookCover(size.width, size.height)) {
      probeCache.set(url, "unavailable");
      return "unavailable";
    }

    // Color PNG placeholders are ~300×391; without a full-file hash, treat
    // truecolor PNGs under 20KB at that size as unavailable.
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
    if (
      isPng &&
      size.width === 300 &&
      size.height === 391 &&
      bytes.length <= 20_000
    ) {
      probeCache.set(url, "unavailable");
      return "unavailable";
    }

    probeCache.set(url, "ok");
    return "ok";
  } catch {
    // Timeouts / network blips — never cache as a permanent miss.
    return "error";
  }
}

/**
 * Pick the sharpest Google cover zoom that actually returns a real cover.
 * Falls back through lower zooms when a candidate is missing or the
 * "image not available" placeholder.
 *
 * When every probe fails (timeouts) or only placeholders exist, still return a
 * stable zoom=1 URL so search and detail stay consistent — search renders the
 * raw catalog URL without probing.
 */
export async function resolveCoverUrl(
  coverUrl: string | null,
  quality: CoverImageQuality,
): Promise<string | null> {
  if (!coverUrl) {
    return null;
  }

  const cacheKey = `${quality}:${coverUrl}`;
  const cached = resolveCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const candidates = getCoverUrlCandidates(coverUrl, quality);
  let sawTransportError = false;

  for (const candidate of candidates) {
    const result = await probeCoverUrl(candidate);
    if (result === "ok") {
      resolveCache.set(cacheKey, candidate);
      return candidate;
    }
    if (result === "error") {
      sawTransportError = true;
    }
  }

  // Keep a displayable URL. Prefer rewritten zoom=1 (what search typically uses)
  // over wiping the cover to null after a probe miss or Google placeholder.
  const fallback = getStableCoverUrl(coverUrl);

  // If probes only failed due to transport errors, avoid caching the fallback so
  // a later request can still discover a sharper zoom.
  if (!sawTransportError) {
    resolveCache.set(cacheKey, fallback);
  }

  return fallback;
}

export async function resolveRelatedBookCovers<
  T extends { coverUrl: string | null },
>(books: T[], quality: CoverImageQuality): Promise<T[]> {
  const resolved = await Promise.all(
    books.map(async (book) => {
      if (!book.coverUrl) {
        return { ...book, coverUrl: null };
      }

      const coverUrl = await resolveCoverUrl(book.coverUrl, quality);
      if (!coverUrl) {
        return { ...book, coverUrl: null };
      }

      // Drop carousel entries whose best URL is still a confirmed placeholder.
      const probe = await probeCoverUrl(coverUrl);
      if (probe === "unavailable") {
        return { ...book, coverUrl: null };
      }

      return { ...book, coverUrl };
    }),
  );

  return resolved.filter((book) => book.coverUrl !== null);
}
