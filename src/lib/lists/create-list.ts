import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { mapListRow } from "@/src/lib/lists/map-list-row";
import type { List } from "@/src/types/list";

export const createListSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  isPrivate: z.boolean(),
});

export type CreateListInput = z.infer<typeof createListSchema>;

export async function createList(
  supabase: SupabaseClient,
  userId: string,
  input: CreateListInput,
): Promise<List> {
  const { data, error } = await supabase
    .from("lists")
    .insert({
      user_id: userId,
      name: input.name,
      is_private: input.isPrivate,
      is_default: false,
    })
    .select("id, user_id, name, description, is_default, is_private, created_at")
    .single();

  if (error || !data) {
    throw new Error("Unable to create list");
  }

  return mapListRow(data);
}
