import { cache } from "react";
import { getListBooks } from "@/src/lib/lists/get-list-books";
import { mapListRow } from "@/src/lib/lists/map-list-row";
import { createClient } from "@/src/lib/supabase/server";
import type { ListDetail } from "@/src/types/list";

async function getListDetailUncached(
  userId: string,
  listId: string,
): Promise<ListDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lists")
    .select("id, user_id, name, description, is_default, is_private, created_at")
    .eq("id", listId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const isOwner = data.user_id === userId;
  const isReadable = isOwner || !data.is_private;

  if (!isReadable) {
    return null;
  }

  const books = await getListBooks(supabase, listId);

  return {
    list: mapListRow(data),
    books,
    isOwner,
  };
}

export const getListDetail = cache(getListDetailUncached);
