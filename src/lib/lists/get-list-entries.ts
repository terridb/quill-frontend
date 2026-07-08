import type { SupabaseClient } from "@supabase/supabase-js";
import { mapListEntryRow } from "@/src/lib/lists/map-list-row";
import type { ListEntry } from "@/src/types/list";

export async function getListEntries(
  supabase: SupabaseClient,
  listId: string,
): Promise<ListEntry[]> {
  const { data, error } = await supabase
    .from("list_entries")
    .select(
      "id, list_id, api_id, current_page, started_at, finished_at, added_at",
    )
    .eq("list_id", listId)
    .order("added_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map(mapListEntryRow);
}
