import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ensureBookRecord,
  getBookIdByApiId,
} from "@/src/lib/books/ensure-book-record";
import {
  listNameToReadingStatus,
  readingStatusToListName,
} from "@/src/lib/lists/reading-status-map";
import { getUserLists } from "@/src/lib/lists/get-user-lists";
import type { UpdateBookLibraryInput } from "@/src/types/book-library";
import type { Database } from "@/src/types/database";
import { z } from "zod";

export const updateBookLibrarySchema = z.object({
  readingStatus: z
    .enum(["want_to_read", "currently_reading", "finished", "did_not_finish"])
    .nullable(),
  /** When omitted, custom-list membership is left unchanged. */
  customListIds: z.array(z.string().uuid()).optional(),
  removeFromLibrary: z.boolean().optional(),
});

type TypedSupabaseClient = SupabaseClient<Database>;

export async function updateBookLibrary(
  supabase: TypedSupabaseClient,
  userId: string,
  apiId: string,
  input: UpdateBookLibraryInput,
): Promise<void> {
  const userLists = await getUserLists(supabase, userId);
  const listIds = userLists.map((list) => list.id);

  if (listIds.length === 0) {
    return;
  }

  if (input.removeFromLibrary) {
    const internalBookId = await getBookIdByApiId(supabase, apiId);

    if (!internalBookId) {
      return;
    }

    const { error } = await supabase
      .from("list_entries")
      .delete()
      .eq("book_id", internalBookId)
      .in("list_id", listIds);

    if (error) {
      throw new Error("Unable to update library");
    }

    return;
  }

  const willAddToAnyList =
    input.readingStatus !== null ||
    (input.customListIds !== undefined && input.customListIds.length > 0);

  const bookRecord = willAddToAnyList
    ? await ensureBookRecord(supabase, apiId)
    : null;

  const internalBookId = bookRecord
    ? bookRecord.id
    : await getBookIdByApiId(supabase, apiId);

  if (!internalBookId) {
    return;
  }

  const defaultLists = userLists.filter((list) => list.isDefault);
  const customLists = userLists.filter((list) => !list.isDefault);
  const customListIdSet = new Set(customLists.map((list) => list.id));

  const { data: currentEntries, error: fetchError } = await supabase
    .from("list_entries")
    .select("id, list_id")
    .eq("book_id", internalBookId)
    .in("list_id", listIds);

  if (fetchError || !currentEntries) {
    throw new Error("Unable to update library");
  }

  const currentByListId = new Map(
    currentEntries.map((entry) => [entry.list_id, entry.id] as const),
  );

  const deleteIds: string[] = [];
  const catalogPageCount = bookRecord?.pageCount ?? null;
  const inserts: {
    list_id: string;
    book_id: string;
    page_count: number | null;
  }[] = [];

  const currentDefaultList = defaultLists.find((list) => currentByListId.has(list.id));
  const currentStatus = currentDefaultList
    ? listNameToReadingStatus(currentDefaultList.name)
    : null;
  const currentDefaultEntryId = currentDefaultList
    ? currentByListId.get(currentDefaultList.id)
    : undefined;

  if (input.readingStatus !== currentStatus) {
    if (currentDefaultEntryId && input.readingStatus) {
      const targetName = readingStatusToListName(input.readingStatus);
      const targetList = defaultLists.find((list) => list.name === targetName);

      if (!targetList) {
        throw new Error("Unable to update library");
      }

      // Move in place so reading_logs stay attached to this entry.
      const { error: moveError } = await supabase
        .from("list_entries")
        .update({
          list_id: targetList.id,
          finished_at: input.readingStatus === "finished" ? undefined : null,
        })
        .eq("id", currentDefaultEntryId);

      if (moveError) {
        throw new Error("Unable to update library");
      }
    } else if (currentDefaultEntryId && !input.readingStatus) {
      deleteIds.push(currentDefaultEntryId);
    } else if (!currentDefaultEntryId && input.readingStatus) {
      const targetName = readingStatusToListName(input.readingStatus);
      const targetList = defaultLists.find((list) => list.name === targetName);

      if (targetList) {
        inserts.push({
          list_id: targetList.id,
          book_id: internalBookId,
          page_count: catalogPageCount,
        });
      }
    }
  }

  if (input.customListIds !== undefined) {
    const validCustomIds = input.customListIds.filter((id) =>
      customListIdSet.has(id),
    );
    const desiredCustomSet = new Set(validCustomIds);

    for (const list of customLists) {
      const hasEntry = currentByListId.has(list.id);
      const shouldHave = desiredCustomSet.has(list.id);

      if (shouldHave && !hasEntry) {
        inserts.push({
          list_id: list.id,
          book_id: internalBookId,
          page_count: catalogPageCount,
        });
      } else if (!shouldHave && hasEntry) {
        const entryId = currentByListId.get(list.id);
        if (entryId) {
          deleteIds.push(entryId);
        }
      }
    }
  }

  if (deleteIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("list_entries")
      .delete()
      .in("id", deleteIds);

    if (deleteError) {
      throw new Error("Unable to update library");
    }
  }

  if (inserts.length > 0) {
    const { error: insertError } = await supabase.from("list_entries").insert(inserts);

    if (insertError) {
      throw new Error("Unable to update library");
    }
  }
}
