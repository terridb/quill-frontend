import type { SupabaseClient } from "@supabase/supabase-js";
import { verifyCurrentlyReadingEntry } from "@/src/lib/reading/verify-list-entry-access";
import type { Database } from "@/src/types/database";
import { z } from "zod";

type TypedSupabaseClient = SupabaseClient<Database>;

export const logReadingTodaySchema = z.object({
  loggedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  entryId: z.string().uuid(),
});

export type LogReadingTodayInput = z.infer<typeof logReadingTodaySchema>;

export async function logReadingToday(
  supabase: TypedSupabaseClient,
  userId: string,
  input: LogReadingTodayInput,
): Promise<void> {
  const entry = await verifyCurrentlyReadingEntry(
    supabase,
    userId,
    input.entryId,
  );

  if (!entry) {
    throw new Error("List entry not found");
  }

  const { error } = await supabase.from("reading_logs").upsert(
    {
      user_id: userId,
      logged_date: input.loggedDate,
      list_entry_id: input.entryId,
      pages_read: 0,
    },
    { onConflict: "user_id,logged_date,list_entry_id" },
  );

  if (error) {
    throw new Error("Unable to log reading");
  }
}
