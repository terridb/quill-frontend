import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

export type BookKind = "fiction" | "nonfiction" | "unknown";

const FICTION_PATTERN = /\bfiction\b/i;

const NONFICTION_PATTERNS: RegExp[] = [
  /\bbiograph/i,
  /\bautobiograph/i,
  /\bmemoir\b/i,
  /\bhistory\b/i,
  /\bsocial\s+science/i,
  /\bpsychology\b/i,
  /\bscience\b/i,
  /\bself[-\s]?help\b/i,
  /\btrue\s+crime\b/i,
  /\bpolitic/i,
  /\beconomics\b/i,
  /\bphilosophy\b/i,
  /\breference\b/i,
  /\beducation\b/i,
  /\bmedical\b/i,
  /\blaw\b/i,
  /\breligion\b/i,
  /\btravel\b/i,
  /\bcooking\b/i,
  /\bart\b/i,
  /\bmusic\b/i,
  /\bcomputers\b/i,
  /\btechnology\b/i,
  /\bbusiness\b/i,
];

function flattenCategoryText(volume: GoogleBooksVolume): string[] {
  const parts: string[] = [];

  const mainCategory = volume.volumeInfo.mainCategory?.trim();
  if (mainCategory) {
    parts.push(mainCategory);
  }

  for (const category of volume.volumeInfo.categories ?? []) {
    for (const segment of category.split(/\s*\/\s*/)) {
      const trimmed = segment.trim();
      if (trimmed) {
        parts.push(trimmed);
      }
    }
  }

  return parts;
}

function hasFictionSignal(parts: string[]): boolean {
  return parts.some((part) => FICTION_PATTERN.test(part));
}

function hasNonfictionSignal(parts: string[]): boolean {
  return parts.some((part) => NONFICTION_PATTERNS.some((pattern) => pattern.test(part)));
}

export function getBookKind(volume: GoogleBooksVolume): BookKind {
  const parts = flattenCategoryText(volume);

  if (parts.length === 0) {
    return "unknown";
  }

  const fiction = hasFictionSignal(parts);
  const nonfiction = hasNonfictionSignal(parts);

  if (fiction && !nonfiction) {
    return "fiction";
  }

  if (nonfiction && !fiction) {
    return "nonfiction";
  }

  if (fiction) {
    return "fiction";
  }

  if (nonfiction) {
    return "nonfiction";
  }

  return "unknown";
}

export function matchesBookKind(
  sourceKind: BookKind,
  candidateKind: BookKind,
): boolean {
  if (sourceKind === "unknown" || candidateKind === "unknown") {
    return true;
  }

  return sourceKind === candidateKind;
}
