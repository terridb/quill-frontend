import type { SupabaseClient } from "@supabase/supabase-js";
import { verifyCurrentlyReadingEntry } from "@/src/lib/reading/verify-list-entry-access";
import type { Database } from "@/src/types/database";
import { z } from "zod";

type TypedSupabaseClient = SupabaseClient<Database>;

const MAX_SMALLINT = 32767;

export const updateListEntryProgressSchema = z.object({
  currentPage: z.number().int().min(0).max(MAX_SMALLINT),
  pageCount: z.number().int().min(1).max(MAX_SMALLINT).optional(),
  loggedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type UpdateListEntryProgressInput = z.infer<
  typeof updateListEntryProgressSchema
>;

export async function updateListEntryProgress(
  supabase: TypedSupabaseClient,
  userId: string,
  entryId: string,
  input: UpdateListEntryProgressInput,
  loggedDate: string,
): Promise<void> {
  const entry = await verifyCurrentlyReadingEntry(supabase, userId, entryId);

  if (!entry) {
    throw new Error("List entry not found");
  }

  const previousPage = entry.currentPage ?? 0;
  const pagesDelta = Math.max(0, input.currentPage - previousPage);

  const existingLogPromise = supabase
    .from("reading_logs")
    .select("pages_read")
    .eq("user_id", userId)
    .eq("logged_date", loggedDate)
    .eq("list_entry_id", entryId)
    .maybeSingle();

  const { error: updateError } = await supabase
    .from("list_entries")
    .update({
      current_page: input.currentPage,
      ...(input.pageCount !== undefined ? { page_count: input.pageCount } : {}),
    })
    .eq("id", entryId);

  if (updateError) {
    throw new Error("Unable to update progress");
  }

  const { data: existingLog, error: existingLogError } =
    await existingLogPromise;

  if (existingLogError) {
    throw new Error("Unable to update reading log");
  }

  // Sum deltas when the same book is logged more than once on the same day.
  const pagesRead = Math.min(
    MAX_SMALLINT,
    (existingLog?.pages_read ?? 0) + pagesDelta,
  );

  const { error: logError } = await supabase.from("reading_logs").upsert(
    {
      user_id: userId,
      logged_date: loggedDate,
      list_entry_id: entryId,
      pages_read: pagesRead,
    },
    { onConflict: "user_id,logged_date,list_entry_id" },
  );

  if (logError) {
    throw new Error("Unable to update reading log");
  }
}
