import type { SupabaseClient } from "@supabase/supabase-js";
import { mapListRow } from "@/src/lib/lists/map-list-row";
import type { List } from "@/src/types/list";

export async function getDefaultList(
  supabase: SupabaseClient,
  userId: string,
): Promise<List | null> {
  const { data, error } = await supabase
    .from("lists")
    .select("id, user_id, name, description, is_default, is_private, created_at")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapListRow(data);
}
