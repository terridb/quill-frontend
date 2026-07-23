import type { RelatedBook } from "@/src/types/book";
import { bookIdentityKey } from "@/src/lib/ai/book-identity";

/**
 * Prefer the first occurrence of each volume id and each title+author identity.
 * Used when merging catalog rows with Google editions of the same work.
 */
export function dedupeRelatedBooks(books: RelatedBook[]): RelatedBook[] {
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const unique: RelatedBook[] = [];

  for (const book of books) {
    const key = bookIdentityKey(book.authors, book.title);

    if (seenIds.has(book.bookId) || seenKeys.has(key)) {
      continue;
    }

    seenIds.add(book.bookId);
    seenKeys.add(key);
    unique.push(book);
  }

  return unique;
}

export function mergeRelatedBooks(
  preferred: RelatedBook[],
  fallback: RelatedBook[],
  limit: number,
): RelatedBook[] {
  const merged = dedupeRelatedBooks(preferred);
  const seenIds = new Set(merged.map((book) => book.bookId));
  const seenKeys = new Set(
    merged.map((book) => bookIdentityKey(book.authors, book.title)),
  );

  for (const book of fallback) {
    if (merged.length >= limit) {
      break;
    }

    const key = bookIdentityKey(book.authors, book.title);

    if (seenIds.has(book.bookId) || seenKeys.has(key)) {
      continue;
    }

    seenIds.add(book.bookId);
    seenKeys.add(key);
    merged.push(book);
  }

  return merged;
}
