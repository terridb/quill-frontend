import type { ListBook, ListEntryWithBook } from "@/src/types/list";

export async function entriesToListBooks(
  entries: ListEntryWithBook[],
): Promise<ListBook[]> {
  return entries.map((entry) => ({
    entryId: entry.id,
    addedAt: entry.addedAt,
    bookId: entry.apiId,
    title: entry.title,
    authors: entry.authors,
    coverUrl: entry.coverUrl,
  }));
}
