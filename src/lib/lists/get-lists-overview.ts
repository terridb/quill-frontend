import { cache } from "react";
import { entriesToListBooks } from "@/src/lib/lists/entries-to-list-books";
import { getListEntries } from "@/src/lib/lists/get-list-entries";
import { getUserLists } from "@/src/lib/lists/get-user-lists";
import { sortDefaultLists } from "@/src/lib/lists/sort-default-lists";
import { createClient } from "@/src/lib/supabase/server";
import type { List, ListsOverview, ListWithBooks } from "@/src/types/list";

async function getListsOverviewUncached(userId: string): Promise<ListsOverview> {
  const supabase = await createClient();
  const allLists = await getUserLists(supabase, userId);
  const defaultListRows = sortDefaultLists(allLists.filter((list) => list.isDefault));
  const customListRows = allLists.filter((list) => !list.isDefault);

  const entryResults = await Promise.all(
    allLists.map(async (list) => {
      const entries = await getListEntries(supabase, list.id);
      return { listId: list.id, entries };
    }),
  );

  const entriesByListId = new Map(
    entryResults.map((result) => [result.listId, result.entries]),
  );

  const allEntries = entryResults.flatMap((result) => result.entries);
  const allBooks = await entriesToListBooks(allEntries);
  const booksByEntryId = new Map(allBooks.map((book) => [book.entryId, book]));

  const defaultLists: ListWithBooks[] = defaultListRows.map((list) => {
    const entries = entriesByListId.get(list.id) ?? [];
    const books = entries
      .map((entry) => booksByEntryId.get(entry.id))
      .filter((book): book is NonNullable<typeof book> => book !== undefined);

    return {
      ...list,
      books,
      entryCount: entries.length,
    };
  });

  const customLists: ListWithBooks[] = customListRows.map((list) => {
    const entries = entriesByListId.get(list.id) ?? [];
    const books = entries
      .map((entry) => booksByEntryId.get(entry.id))
      .filter((book): book is NonNullable<typeof book> => book !== undefined);

    return {
      ...list,
      books,
      entryCount: entries.length,
    };
  });

  return { defaultLists, customLists };
}

export const getListsOverview = cache(getListsOverviewUncached);
