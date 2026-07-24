import { tool } from "ai";
import { z } from "zod";
import { ensureBookRecord } from "@/src/lib/books/ensure-book-record";
import {
  aiMutableListError,
  isAiMutableList,
} from "@/src/lib/ai/mutable-list-guard";
import {
  filterToAllowedApiIds,
  resolveReferentialAddApiIds,
} from "@/src/lib/ai/recommendation-scope";
import type { AiToolContext } from "@/src/lib/ai/tool-context";
import { getUserLists } from "@/src/lib/lists/get-user-lists";

export function createAddBooksToListTool(ctx: AiToolContext) {
  return tool({
    description:
      "Add one or more books to a custom list or Want To Read in a single call. Put every requested Google Books volume id in apiIds (max 10) — never call this tool once per book when the user asked to add several. When the user says 'those' / 'these' / 'all of them' after a recommendation, include only the apiIds of the books you numbered in that recommendation — never extra search hits or similar titles. Requires one user confirmation for the whole batch. Never use for Currently Reading or Finished — use set_reading_status instead. Never use for Did Not Finish. skipped entries include reason: already_on_list, ensure_failed, or insert_failed. Only say a book was already on the list when reason is already_on_list.",
    inputSchema: z.object({
      listId: z.string().uuid(),
      apiIds: z
        .array(z.string().trim().min(1))
        .min(1)
        .max(10)
        .describe(
          "All Google Books volume ids to add in this one call (not one id per tool call)",
        ),
    }),
    needsApproval: true,
    execute: async ({ listId, apiIds: requestedApiIds }) => {
      try {
        const allowed = resolveReferentialAddApiIds(ctx.messages ?? []);
        const apiIds = filterToAllowedApiIds(requestedApiIds, allowed);
        const dropped = requestedApiIds.filter((id) => !apiIds.includes(id));

        if (apiIds.length === 0) {
          return {
            error:
              allowed.length > 0
                ? "None of those apiIds match the books just recommended. Use only the recommended titles’ apiIds."
                : "No books to add.",
            dropped,
          };
        }

        const lists = await getUserLists(ctx.supabase, ctx.userId);
        const list = lists.find((item) => item.id === listId);

        if (!list) {
          return { error: "List not found in your library." };
        }

        if (!isAiMutableList(list)) {
          return { error: aiMutableListError(list.name) };
        }

        const added: string[] = [];
        const skipped: Array<{
          apiId: string;
          reason:
            | "already_on_list"
            | "ensure_failed"
            | "insert_failed"
            | "not_in_requested_set";
        }> = [];

        for (const apiId of dropped) {
          skipped.push({ apiId, reason: "not_in_requested_set" });
        }

        for (const apiId of apiIds) {
          let book;
          try {
            book = await ensureBookRecord(ctx.supabase, apiId);
          } catch {
            skipped.push({ apiId, reason: "ensure_failed" });
            continue;
          }

          const { data: existing } = await ctx.supabase
            .from("list_entries")
            .select("id")
            .eq("list_id", list.id)
            .eq("book_id", book.id)
            .maybeSingle();

          if (existing) {
            skipped.push({ apiId, reason: "already_on_list" });
            continue;
          }

          const { error } = await ctx.supabase.from("list_entries").insert({
            list_id: list.id,
            book_id: book.id,
            page_count: book.pageCount,
          });

          if (error) {
            skipped.push({ apiId, reason: "insert_failed" });
            continue;
          }

          added.push(apiId);
        }

        return {
          listId: list.id,
          listName: list.name,
          added,
          skipped,
        };
      } catch {
        return { error: "Unable to add books to that list." };
      }
    },
  });
}
