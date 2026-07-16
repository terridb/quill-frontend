import type { SupabaseClient } from "@supabase/supabase-js";
import { entriesToListBooks } from "@/src/lib/lists/entries-to-list-books";
import { getListEntries } from "@/src/lib/lists/get-list-entries";
import type { ListBook } from "@/src/types/list";

export async function getListBooks(
  supabase: SupabaseClient,
  listId: string,
): Promise<ListBook[]> {
  const entries = await getListEntries(supabase, listId);
  return entriesToListBooks(entries);
}
