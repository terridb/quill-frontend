import { fetchBookSummaries } from "@/src/lib/books/fetch-book-summaries";
import type { ListEntry, ListBook } from "@/src/types/list";

export async function entriesToListBooks(
  entries: ListEntry[],
): Promise<ListBook[]> {
  if (entries.length === 0) {
    return [];
  }

  const summaries = await fetchBookSummaries(entries.map((entry) => entry.apiId));
  const books: ListBook[] = [];

  for (const entry of entries) {
    const summary = summaries.get(entry.apiId);

    if (!summary) {
      continue;
    }

    books.push({
      entryId: entry.id,
      addedAt: entry.addedAt,
      bookId: summary.bookId,
      title: summary.title,
      authors: summary.authors,
      coverUrl: summary.coverUrl,
    });
  }

  return books;
}
