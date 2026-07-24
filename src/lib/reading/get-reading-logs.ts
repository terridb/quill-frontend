import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/src/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;

export interface ReadingLogRow {
  loggedDate: string;
  listEntryId: string | null;
  pagesRead: number;
}

export async function getReadingLogsInRange(
  supabase: TypedSupabaseClient,
  userId: string,
  from: string,
  to: string,
): Promise<ReadingLogRow[]> {
  const { data, error } = await supabase
    .from("reading_logs")
    .select("logged_date, list_entry_id, pages_read")
    .eq("user_id", userId)
    .gte("logged_date", from)
    .lte("logged_date", to)
    .order("logged_date", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    loggedDate: row.logged_date,
    listEntryId: row.list_entry_id,
    pagesRead: row.pages_read,
  }));
}

export async function getDistinctReadingDates(
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("reading_logs")
    .select("logged_date")
    .eq("user_id", userId)
    .order("logged_date", { ascending: false });

  if (error || !data) {
    return [];
  }

  return [...new Set(data.map((row) => row.logged_date))];
}
