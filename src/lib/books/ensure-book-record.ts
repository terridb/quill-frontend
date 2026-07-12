import type { SupabaseClient } from "@supabase/supabase-js";
import { googleBooksFetch } from "@/src/lib/books/google-books/client";
import { isUserFacingBook } from "@/src/lib/books/google-books/is-user-facing-book";
import { mapVolumeToBookRow } from "@/src/lib/books/map-volume-to-book-row";
import { googleBooksVolumeSchema } from "@/src/lib/books/google-books/schemas";
import type { Database } from "@/src/types/database";

export interface BookRecordRef {
  id: string;
  apiId: string;
}

type TypedSupabaseClient = SupabaseClient<Database>;

async function fetchGoogleVolume(apiId: string) {
  let response: Response;

  try {
    response = await googleBooksFetch(`/volumes/${encodeURIComponent(apiId)}`);
  } catch {
    throw new Error("Unable to reach Google Books");
  }

  if (!response.ok) {
    throw new Error("Book not found");
  }

  const json: unknown = await response.json();
  const parsed = googleBooksVolumeSchema.safeParse(json);

  if (!parsed.success || !isUserFacingBook(parsed.data)) {
    throw new Error("Book not found");
  }

  return parsed.data;
}

export async function ensureBookRecord(
  supabase: TypedSupabaseClient,
  apiId: string,
): Promise<BookRecordRef> {
  const { data: existing, error: lookupError } = await supabase
    .from("books")
    .select("id, api_id")
    .eq("api_id", apiId)
    .maybeSingle();

  if (lookupError) {
    throw new Error("Unable to load book");
  }

  if (existing) {
    return { id: existing.id, apiId: existing.api_id };
  }

  const volume = await fetchGoogleVolume(apiId);
  const row = mapVolumeToBookRow(volume);

  const { data: inserted, error: insertError } = await supabase
    .from("books")
    .upsert(row, { onConflict: "api_id" })
    .select("id, api_id")
    .single();

  if (insertError || !inserted) {
    throw new Error("Unable to save book");
  }

  return { id: inserted.id, apiId: inserted.api_id };
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
