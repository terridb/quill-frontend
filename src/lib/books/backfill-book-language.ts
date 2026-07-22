import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/src/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;

/** Sets language only when the catalog row still has none (RLS + column grants). */
export async function backfillBookLanguage(
  supabase: TypedSupabaseClient,
  bookId: string,
  language: string,
): Promise<void> {
  const { error } = await supabase
    .from("books")
    .update({ language })
    .eq("id", bookId)
    .is("language", null);

  if (error) {
    throw new Error("Unable to backfill book language");
  }
}
