import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookSearchResult } from "@/src/types/book";
import type { Database } from "@/src/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;

export async function searchSupabaseBooks(
  supabase: TypedSupabaseClient,
  query: string,
  limit = 20,
): Promise<BookSearchResult[]> {
  const { data, error } = await supabase.rpc("search_books", {
    search_query: query,
    result_limit: limit,
  });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    bookId: row.api_id,
    title: row.title,
    authors: row.author ?? "Unknown author",
    coverUrl: row.cover_url,
  }));
}
