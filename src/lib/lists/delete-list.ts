import type { SupabaseClient } from "@supabase/supabase-js";

export async function deleteList(
  supabase: SupabaseClient,
  userId: string,
  listId: string,
): Promise<void> {
  const { data: list, error: listError } = await supabase
    .from("lists")
    .select("id, is_default")
    .eq("id", listId)
    .eq("user_id", userId)
    .maybeSingle();

  if (listError) {
    throw new Error("Unable to delete list");
  }

  if (!list) {
    throw new Error("List not found");
  }

  if (list.is_default) {
    throw new Error("Default lists cannot be deleted");
  }

  const { error: deleteError } = await supabase
    .from("lists")
    .delete()
    .eq("id", listId)
    .eq("user_id", userId)
    .eq("is_default", false);

  if (deleteError) {
    throw new Error("Unable to delete list");
  }
}
