import type { SupabaseClient } from "@supabase/supabase-js";
import { backfillBookLanguage } from "@/src/lib/books/backfill-book-language";
import { fetchGoogleVolume } from "@/src/lib/books/google-books/fetch-google-volume";
import { mapVolumeToBookRow } from "@/src/lib/books/map-volume-to-book-row";
import type { Database } from "@/src/types/database";

export interface BookRecordRef {
  id: string;
  apiId: string;
  pageCount: number | null;
}

type TypedSupabaseClient = SupabaseClient<Database>;

async function getBookRecordRef(
  supabase: TypedSupabaseClient,
  apiId: string,
): Promise<BookRecordRef | null> {
  const { data, error } = await supabase
    .from("books")
    .select("id, api_id, page_count")
    .eq("api_id", apiId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load book");
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    apiId: data.api_id,
    pageCount: data.page_count,
  };
}

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
        try {
          await backfillBookLanguage(supabase, existing.id, row.language);
        } catch {
          // Language backfill is best-effort.
        }
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

  // Insert only — authenticated users cannot UPDATE catalog columns other than language.
  const { data: inserted, error: insertError } = await supabase
    .from("books")
    .insert(row)
    .select("id, api_id, page_count")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      const raced = await getBookRecordRef(supabase, apiId);
      if (raced) {
        return raced;
      }
    }
    throw new Error("Unable to save book");
  }

  if (!inserted) {
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
