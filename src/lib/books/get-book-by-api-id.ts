import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tables } from "@/src/types/database";
import type { Database } from "@/src/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;

export async function getBookByApiId(
  supabase: TypedSupabaseClient,
  apiId: string,
): Promise<Tables<"books"> | null> {
  const { data, error } = await supabase
    .from("books")
    .select(
      "id, api_id, title, author, cover_url, description, genres, tags, page_count, published_date, isbn, shelf_count, created_at",
    )
    .eq("api_id", apiId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}
