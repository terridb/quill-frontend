import type { RelatedBook } from "@/src/types/book";
import { bookIdentityKey } from "@/src/lib/ai/book-identity";

/**
 * One edition per volume id and per title+author identity.
 * When the same work appears twice, prefer the edition that has a cover.
 */
export function dedupeRelatedBooks(books: RelatedBook[]): RelatedBook[] {
  const bestById = new Map<string, RelatedBook>();
  const bestByKey = new Map<string, RelatedBook>();
  const order: string[] = [];

  for (const book of books) {
    const key = bookIdentityKey(book.authors, book.title);
    const existingById = bestById.get(book.bookId);
    const existingByKey = bestByKey.get(key);

    if (existingById) {
      if (!existingById.coverUrl && book.coverUrl) {
        bestById.set(book.bookId, book);
        if (existingByKey?.bookId === existingById.bookId) {
          bestByKey.set(key, book);
        }
      }
      continue;
    }

    if (existingByKey) {
      if (!existingByKey.coverUrl && book.coverUrl) {
        bestById.delete(existingByKey.bookId);
        bestById.set(book.bookId, book);
        bestByKey.set(key, book);
        const index = order.indexOf(existingByKey.bookId);
        if (index >= 0) {
          order[index] = book.bookId;
        }
      }
      continue;
    }

    bestById.set(book.bookId, book);
    bestByKey.set(key, book);
    order.push(book.bookId);
  }

  return order.flatMap((bookId) => {
    const book = bestById.get(bookId);
    return book ? [book] : [];
  });
}

export function mergeRelatedBooks(
  preferred: RelatedBook[],
  fallback: RelatedBook[],
  limit: number,
): RelatedBook[] {
  const merged = dedupeRelatedBooks([...preferred, ...fallback]);
  return merged.slice(0, limit);
}
