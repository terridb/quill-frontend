import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export const removeListEntriesSchema = z.object({
  entryIds: z
    .array(z.string().uuid())
    .min(1, "Select at least one book")
    .max(50, "You can remove up to 50 books at a time"),
});

export type RemoveListEntriesInput = z.infer<typeof removeListEntriesSchema>;

export async function removeListEntries(
  supabase: SupabaseClient,
  userId: string,
  listId: string,
  input: RemoveListEntriesInput,
): Promise<{ removedIds: string[] }> {
  const { data: list, error: listError } = await supabase
    .from("lists")
    .select("id")
    .eq("id", listId)
    .eq("user_id", userId)
    .maybeSingle();

  if (listError) {
    throw new Error("Unable to remove books from list");
  }

  if (!list) {
    throw new Error("List not found");
  }

  const { data: deleted, error: deleteError } = await supabase
    .from("list_entries")
    .delete()
    .eq("list_id", listId)
    .in("id", input.entryIds)
    .select("id");

  if (deleteError) {
    throw new Error("Unable to remove books from list");
  }

  return {
    removedIds: (deleted ?? []).map((row) => row.id),
  };
}
