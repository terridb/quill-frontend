import { cache } from "react";
import { fetchBookSummaries } from "@/src/lib/books/fetch-book-summaries";
import { getDefaultList } from "@/src/lib/lists/get-default-list";
import { getListEntries } from "@/src/lib/lists/get-list-entries";
import { createClient } from "@/src/lib/supabase/server";
import type { CurrentlyReadingBook } from "@/src/types/list";

async function getCurrentlyReadingUncached(
  userId: string,
): Promise<CurrentlyReadingBook[]> {
  const supabase = await createClient();
  const defaultList = await getDefaultList(supabase, userId);

  if (!defaultList) {
    return [];
  }

  const entries = await getListEntries(supabase, defaultList.id);

  if (entries.length === 0) {
    return [];
  }

  const summaries = await fetchBookSummaries(entries.map((entry) => entry.apiId));

  const books: CurrentlyReadingBook[] = [];

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

export const getCurrentlyReading = cache(getCurrentlyReadingUncached);
