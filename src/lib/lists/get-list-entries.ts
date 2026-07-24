import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveCoverUrl } from "@/src/lib/books/google-books/resolve-cover-url";
import { mapListEntryRow } from "@/src/lib/lists/map-list-row";
import type { ListEntryWithBook } from "@/src/types/list";
import type { Database } from "@/src/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;

export async function getListEntries(
  supabase: TypedSupabaseClient,
  listId: string,
): Promise<ListEntryWithBook[]> {
  const { data, error } = await supabase
    .from("list_entries")
    .select(
      `
      id,
      list_id,
      book_id,
      current_page,
      page_count,
      started_at,
      finished_at,
      added_at,
      books (
        api_id,
        title,
        author,
        cover_url,
        page_count
      )
    `,
    )
    .eq("list_id", listId)
    .order("added_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const entries = data
    .map((row) => mapListEntryRow(row))
    .filter((entry): entry is ListEntryWithBook => entry !== null);

  return Promise.all(
    entries.map(async (entry) => ({
      ...entry,
      coverUrl: await resolveCoverUrl(entry.coverUrl, "medium"),
    })),
  );
}
