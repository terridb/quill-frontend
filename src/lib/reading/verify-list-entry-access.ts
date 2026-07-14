import type { SupabaseClient } from "@supabase/supabase-js";
import { getListByName } from "@/src/lib/lists/get-list-by-name";
import type { Database } from "@/src/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;

const CURRENTLY_READING_LIST_NAME = "Currently Reading";

export interface VerifiedListEntry {
  entryId: string;
  bookId: string;
  apiId: string;
  currentPage: number | null;
}

export async function verifyCurrentlyReadingEntry(
  supabase: TypedSupabaseClient,
  userId: string,
  entryId: string,
): Promise<VerifiedListEntry | null> {
  const list = await getListByName(
    supabase,
    userId,
    CURRENTLY_READING_LIST_NAME,
  );

  if (!list) {
    return null;
  }

  const { data, error } = await supabase
    .from("list_entries")
    .select(
      `
      id,
      book_id,
      current_page,
      books (
        api_id
      )
    `,
    )
    .eq("id", entryId)
    .eq("list_id", list.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const book = Array.isArray(data.books) ? data.books[0] : data.books;

  if (!book) {
    return null;
  }

  return {
    entryId: data.id,
    bookId: data.book_id,
    apiId: book.api_id,
    currentPage: data.current_page,
  };
}
