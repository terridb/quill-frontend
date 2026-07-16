import { tool } from "ai";
import { z } from "zod";
import { getBookIdByApiId } from "@/src/lib/books/ensure-book-record";
import {
  aiMutableListError,
  isAiMutableList,
} from "@/src/lib/ai/mutable-list-guard";
import type { AiToolContext } from "@/src/lib/ai/tool-context";
import { getUserLists } from "@/src/lib/lists/get-user-lists";

export function createRemoveBooksFromListTool(ctx: AiToolContext) {
  return tool({
    description:
      "Remove one or more books from a custom list or Want To Read in a single call. Put every Google Books volume id in apiIds (max 10) — never call this tool once per book when the user asked to remove several. Requires one user confirmation for the whole batch. Never use for Currently Reading, Finished, or Did Not Finish — refuse those requests instead of creating a substitute list.",
    inputSchema: z.object({
      listId: z.string().uuid(),
      apiIds: z
        .array(z.string().trim().min(1))
        .min(1)
        .max(10)
        .describe(
          "All Google Books volume ids to remove in this one call (not one id per tool call)",
        ),
    }),
    needsApproval: true,
    execute: async ({ listId, apiIds }) => {
      try {
        const lists = await getUserLists(ctx.supabase, ctx.userId);
        const list = lists.find((item) => item.id === listId);

        if (!list) {
          return { error: "List not found in your library." };
        }

        if (!isAiMutableList(list)) {
          return { error: aiMutableListError(list.name) };
        }

        const removed: string[] = [];
        const skipped: string[] = [];

        for (const apiId of apiIds) {
          const bookId = await getBookIdByApiId(ctx.supabase, apiId);

          if (!bookId) {
            skipped.push(apiId);
            continue;
          }

          const { data: deleted, error } = await ctx.supabase
            .from("list_entries")
            .delete()
            .eq("list_id", list.id)
            .eq("book_id", bookId)
            .select("id");

          if (error || !deleted?.length) {
            skipped.push(apiId);
            continue;
          }

          removed.push(apiId);
        }

        return {
          listId: list.id,
          listName: list.name,
          removed,
          skipped,
        };
      } catch {
        return { error: "Unable to remove books from that list." };
      }
    },
  });
}
