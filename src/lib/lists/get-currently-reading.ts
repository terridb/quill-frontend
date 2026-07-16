import { cache } from "react";
import { entriesToListBooks } from "@/src/lib/lists/entries-to-list-books";
import { getListByName } from "@/src/lib/lists/get-list-by-name";
import { getListEntries } from "@/src/lib/lists/get-list-entries";
import { createClient } from "@/src/lib/supabase/server";
import type { ListBook } from "@/src/types/list";

const CURRENTLY_READING_LIST_NAME = "Currently Reading";

export interface CurrentlyReadingResult {
  listId: string | null;
  isPrivate: boolean;
  books: ListBook[];
}

async function getCurrentlyReadingUncached(
  userId: string,
): Promise<CurrentlyReadingResult> {
  const supabase = await createClient();
  const list = await getListByName(supabase, userId, CURRENTLY_READING_LIST_NAME);

  if (!list) {
    return { listId: null, isPrivate: false, books: [] };
  }

  const entries = await getListEntries(supabase, list.id);
  const books = await entriesToListBooks(entries);

  return { listId: list.id, isPrivate: list.isPrivate, books };
}

export const getCurrentlyReading = cache(getCurrentlyReadingUncached);
