export type CoverImageQuality = "medium" | "high";

/** Google Books zoom → approximate width: 1≈128, 2≈300, 3≈575, 4≈800. */
const ZOOM_FALLBACKS: Record<CoverImageQuality, readonly string[]> = {
  /** Prefer ~300px, then thumbnail. */
  medium: ["2", "1"],
  /** Prefer ~800px, then step down until something loads. */
  high: ["4", "3", "2", "1"],
};

function isGoogleBooksHost(hostname: string): boolean {
  return (
    hostname === "books.google.com" || hostname.endsWith(".books.google.com")
  );
}

function withZoom(coverUrl: string, zoom: string): string | null {
  try {
    const url = new URL(coverUrl);

    if (!isGoogleBooksHost(url.hostname)) {
      return null;
    }

    // Publisher paths + imgtk tokens are fragile in next/image; prefer the
    // stable /books/content form Google accepts without a token.
    if (url.pathname.includes("/books/publisher/content")) {
      url.pathname = url.pathname.replace(
        "/books/publisher/content",
        "/books/content",
      );
    }

    url.searchParams.delete("imgtk");
    url.searchParams.delete("edge");
    url.searchParams.set("zoom", zoom);

    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Candidate Google cover URLs for a display size, preferred first.
 *
 * Catalog rows keep stable zoom=1 thumbnails. Display code tries a sharper zoom
 * and falls back through lower zooms (then the original URL) when a candidate
 * fails to load or returns a non-cover image.
 */
export function getCoverUrlCandidates(
  coverUrl: string | null,
  quality: CoverImageQuality,
): string[] {
  if (!coverUrl) {
    return [];
  }

  const candidates: string[] = [];
  const seen = new Set<string>();

  const push = (url: string | null) => {
    if (!url || seen.has(url)) {
      return;
    }
    seen.add(url);
    candidates.push(url);
  };

  for (const zoom of ZOOM_FALLBACKS[quality]) {
    push(withZoom(coverUrl, zoom));
  }

  push(coverUrl);

  return candidates;
}

/**
 * Preferred cover URL for a quality tier (first candidate).
 * Prefer `getCoverUrlCandidates` + load fallbacks in UI.
 */
export function toHighQualityCoverUrl(
  coverUrl: string | null,
  quality: CoverImageQuality = "high",
): string | null {
  return getCoverUrlCandidates(coverUrl, quality)[0] ?? null;
}

/**
 * Stable thumbnail-sized Google cover (zoom=1, no imgtk / publisher path).
 * Used when sharper zooms are missing or probing fails — matches what search shows.
 */
export function getStableCoverUrl(coverUrl: string): string {
  return withZoom(coverUrl, "1") ?? coverUrl;
}

/** Portrait book covers are ~2:3; reject strips / tiny placeholders. */
export function isPlausibleBookCover(width: number, height: number): boolean {
  if (width < 40 || height < 40) {
    return false;
  }

  const ratio = width / height;
  return ratio >= 0.45 && ratio <= 0.85;
}
