import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchGoogleVolume } from "@/src/lib/books/google-books/fetch-google-volume";
import { mapVolumeToBookRow } from "@/src/lib/books/map-volume-to-book-row";
import type { Database } from "@/src/types/database";

export interface BookRecordRef {
  id: string;
  apiId: string;
  pageCount: number | null;
}

type TypedSupabaseClient = SupabaseClient<Database>;

export async function ensureBookRecord(
  supabase: TypedSupabaseClient,
  apiId: string,
): Promise<BookRecordRef> {
  const { data: existing, error: lookupError } = await supabase
    .from("books")
    .select("id, api_id, language, page_count")
    .eq("api_id", apiId)
    .maybeSingle();

  if (lookupError) {
    throw new Error("Unable to load book");
  }

  if (existing) {
    if (!existing.language) {
      const volume = await fetchGoogleVolume(apiId);
      const row = mapVolumeToBookRow(volume);

      if (row.language) {
        await supabase
          .from("books")
          .update({ language: row.language })
          .eq("id", existing.id);
      }
    }

    return {
      id: existing.id,
      apiId: existing.api_id,
      pageCount: existing.page_count,
    };
  }

  const volume = await fetchGoogleVolume(apiId);
  const row = mapVolumeToBookRow(volume);

  const { data: inserted, error: insertError } = await supabase
    .from("books")
    .upsert(row, { onConflict: "api_id" })
    .select("id, api_id, page_count")
    .single();

  if (insertError || !inserted) {
    throw new Error("Unable to save book");
  }

  return {
    id: inserted.id,
    apiId: inserted.api_id,
    pageCount: inserted.page_count,
  };
}

export async function getBookIdByApiId(
  supabase: TypedSupabaseClient,
  apiId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("books")
    .select("id")
    .eq("api_id", apiId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.id;
}
