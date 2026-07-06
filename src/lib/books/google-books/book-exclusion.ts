import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

export interface BookExclusion {
  bookId: string;
  isbns: Set<string>;
}

function normalizeIsbn(isbn: string): string {
  return isbn.replace(/-/g, "").toUpperCase();
}

export function getBookExclusion(volume: GoogleBooksVolume): BookExclusion {
  const isbns = new Set<string>();

  for (const identifier of volume.volumeInfo.industryIdentifiers ?? []) {
    if (identifier.type.includes("ISBN")) {
      isbns.add(normalizeIsbn(identifier.identifier));
    }
  }

  return {
    bookId: volume.id,
    isbns,
  };
}

export function isExcludedVolume(
  volume: GoogleBooksVolume,
  exclusion: BookExclusion,
): boolean {
  if (volume.id === exclusion.bookId) {
    return true;
  }

  if (exclusion.isbns.size === 0) {
    return false;
  }

  for (const identifier of volume.volumeInfo.industryIdentifiers ?? []) {
    if (
      identifier.type.includes("ISBN") &&
      exclusion.isbns.has(normalizeIsbn(identifier.identifier))
    ) {
      return true;
    }
  }

  return false;
}
