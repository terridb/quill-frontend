import { bookIdentityKey } from "@/src/lib/ai/book-identity";
import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

export interface BookExclusion {
  bookId: string;
  isbns: Set<string>;
  /** Same work across editions (title + author), when known. */
  identityKey: string | null;
}

function normalizeIsbn(isbn: string): string {
  return isbn.replace(/-/g, "").toUpperCase();
}

function formatAuthors(authors: string[] | undefined): string {
  return authors?.length ? authors.join(", ") : "Unknown author";
}

export function volumeIdentityKey(volume: GoogleBooksVolume): string | null {
  const title = volume.volumeInfo.title?.trim();
  if (!title) {
    return null;
  }

  return bookIdentityKey(formatAuthors(volume.volumeInfo.authors), title);
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
    identityKey: volumeIdentityKey(volume),
  };
}

export function buildBookExclusion(options: {
  bookId: string;
  isbn?: string | null;
  title?: string | null;
  authors?: string | null;
}): BookExclusion {
  const isbns = new Set<string>();

  if (options.isbn) {
    isbns.add(normalizeIsbn(options.isbn));
  }

  const title = options.title?.trim();
  const authors = options.authors?.trim();

  return {
    bookId: options.bookId,
    isbns,
    identityKey:
      title && authors ? bookIdentityKey(authors, title) : null,
  };
}

export function isExcludedVolume(
  volume: GoogleBooksVolume,
  exclusion: BookExclusion,
): boolean {
  if (volume.id === exclusion.bookId) {
    return true;
  }

  if (exclusion.identityKey) {
    const key = volumeIdentityKey(volume);
    if (key && key === exclusion.identityKey) {
      return true;
    }
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
