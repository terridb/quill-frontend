import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getBookIdByApiId } from "@/src/lib/books/ensure-book-record";
import { sortDefaultLists } from "@/src/lib/lists/sort-default-lists";
import { listNameToReadingStatus } from "@/src/lib/lists/reading-status-map";
import { getUserLists } from "@/src/lib/lists/get-user-lists";
import { createClient } from "@/src/lib/supabase/server";
import type { BookLibraryState } from "@/src/types/book-library";
import type { ReadingStatus } from "@/src/types/book";
import type { Database } from "@/src/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;

export async function getBookLibraryForUser(
  supabase: TypedSupabaseClient,
  userId: string,
  apiId: string,
): Promise<BookLibraryState> {
  const userLists = await getUserLists(supabase, userId);
  const defaultLists = sortDefaultLists(userLists.filter((list) => list.isDefault));
  const customLists = userLists.filter((list) => !list.isDefault);
  const listIds = userLists.map((list) => list.id);

  if (listIds.length === 0) {
    return {
      readingStatus: null,
      customListIds: [],
      defaultLists,
      customLists,
    };
  }

  const internalBookId = await getBookIdByApiId(supabase, apiId);

  if (!internalBookId) {
    return {
      readingStatus: null,
      customListIds: [],
      defaultLists,
      customLists,
    };
  }

  const { data: entries, error } = await supabase
    .from("list_entries")
    .select("list_id")
    .eq("book_id", internalBookId)
    .in("list_id", listIds);

  if (error || !entries) {
    return {
      readingStatus: null,
      customListIds: [],
      defaultLists,
      customLists,
    };
  }

  const entryListIds = new Set(entries.map((entry) => entry.list_id));
  let readingStatus: ReadingStatus | null = null;
  const customListIds: string[] = [];

  for (const list of userLists) {
    if (!entryListIds.has(list.id)) {
      continue;
    }

    if (list.isDefault) {
      const status = listNameToReadingStatus(list.name);
      if (status) {
        readingStatus = status;
      }
      continue;
    }

    customListIds.push(list.id);
  }

  return {
    readingStatus,
    customListIds,
    defaultLists,
    customLists,
  };
}

async function getBookLibraryUncached(
  userId: string,
  apiId: string,
): Promise<BookLibraryState> {
  const supabase = await createClient();
  return getBookLibraryForUser(supabase, userId, apiId);
}

export const getBookLibrary = cache(getBookLibraryUncached);
