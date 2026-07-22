import type { SupabaseClient } from "@supabase/supabase-js";
import { ensureBookRecord } from "@/src/lib/books/ensure-book-record";
import {
  listNameToReadingStatus,
  readingStatusToListName,
} from "@/src/lib/lists/reading-status-map";
import { getUserLists } from "@/src/lib/lists/get-user-lists";
import type { Database } from "@/src/types/database";
import { z } from "zod";

export const FINISHED_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidFinishedDate(value: string): boolean {
  if (!FINISHED_DATE_REGEX.test(value)) {
    return false;
  }

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export const setReadingStatusSchema = z
  .object({
    readingStatus: z.enum(["currently_reading", "finished"]),
    finishedAt: z
      .string()
      .regex(FINISHED_DATE_REGEX, "Use YYYY-MM-DD")
      .refine(isValidFinishedDate, "finishedAt must be a real calendar date")
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.readingStatus === "finished" && !value.finishedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "finishedAt is required when moving a book to Finished. Ask the user which date they finished the book.",
        path: ["finishedAt"],
      });
    }
  });

export type SetReadingStatusInput = z.infer<typeof setReadingStatusSchema>;

type TypedSupabaseClient = SupabaseClient<Database>;

/** Calendar date → timestamptz at UTC noon (stable for date-only UX). */
export function finishedDateToTimestamp(finishedAt: string): string {
  return `${finishedAt}T12:00:00.000Z`;
}

export function missingFinishedDateError(): string {
  return "Cannot move a book to Finished without a finish date. Ask the user which date they finished the book (YYYY-MM-DD), then call again with finishedAt.";
}

/**
 * Move a book onto Currently Reading or Finished.
 * Preserves custom-list membership. Sets finished_at only for Finished.
 */
export async function setReadingStatus(
  supabase: TypedSupabaseClient,
  userId: string,
  apiId: string,
  input: SetReadingStatusInput,
): Promise<{
  apiId: string;
  readingStatus: "currently_reading" | "finished";
  listName: string;
  finishedAt: string | null;
}> {
  const parsed = setReadingStatusSchema.parse(input);

  if (parsed.readingStatus === "finished" && !parsed.finishedAt) {
    throw new Error(missingFinishedDateError());
  }

  const userLists = await getUserLists(supabase, userId);
  const defaultLists = userLists.filter((list) => list.isDefault);
  const defaultListIds = defaultLists.map((list) => list.id);

  if (defaultListIds.length === 0) {
    throw new Error("Unable to update reading status");
  }

  const targetName = readingStatusToListName(parsed.readingStatus);
  const targetList = defaultLists.find((list) => list.name === targetName);

  if (!targetList) {
    throw new Error(`"${targetName}" list not found.`);
  }

  const book = await ensureBookRecord(supabase, apiId);

  const { data: currentEntries, error: fetchError } = await supabase
    .from("list_entries")
    .select("id, list_id")
    .eq("book_id", book.id)
    .in("list_id", defaultListIds);

  if (fetchError || !currentEntries) {
    throw new Error("Unable to update reading status");
  }

  const currentByListId = new Map(
    currentEntries.map((entry) => [entry.list_id, entry.id] as const),
  );

  const finishedAtTimestamp =
    parsed.readingStatus === "finished" && parsed.finishedAt
      ? finishedDateToTimestamp(parsed.finishedAt)
      : null;

  const existingOnTarget = currentByListId.get(targetList.id);

  if (existingOnTarget) {
    if (parsed.readingStatus === "finished") {
      const { error: updateError } = await supabase
        .from("list_entries")
        .update({ finished_at: finishedAtTimestamp })
        .eq("id", existingOnTarget);

      if (updateError) {
        throw new Error("Unable to update reading status");
      }
    }

    return {
      apiId,
      readingStatus: parsed.readingStatus,
      listName: targetList.name,
      finishedAt: parsed.finishedAt ?? null,
    };
  }

  const deleteIds = currentEntries
    .filter((entry) => {
      const list = defaultLists.find((item) => item.id === entry.list_id);
      if (!list) {
        return false;
      }
      return listNameToReadingStatus(list.name) !== null;
    })
    .map((entry) => entry.id);

  if (deleteIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("list_entries")
      .delete()
      .in("id", deleteIds);

    if (deleteError) {
      throw new Error("Unable to update reading status");
    }
  }

  const { error: insertError } = await supabase.from("list_entries").insert({
    list_id: targetList.id,
    book_id: book.id,
    finished_at: finishedAtTimestamp,
  });

  if (insertError) {
    throw new Error("Unable to update reading status");
  }

  return {
    apiId,
    readingStatus: parsed.readingStatus,
    listName: targetList.name,
    finishedAt: parsed.finishedAt ?? null,
  };
}
