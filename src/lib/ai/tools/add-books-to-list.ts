import { tool } from "ai";
import { z } from "zod";
import { ensureBookRecord } from "@/src/lib/books/ensure-book-record";
import {
  aiMutableListError,
  isAiMutableList,
} from "@/src/lib/ai/mutable-list-guard";
import type { AiToolContext } from "@/src/lib/ai/tool-context";
import { getUserLists } from "@/src/lib/lists/get-user-lists";

export function createAddBooksToListTool(ctx: AiToolContext) {
  return tool({
    description:
      "Add books to one of this user's custom lists or Want To Read. Requires user confirmation. Never use for Currently Reading, Finished, or Did Not Finish — refuse those requests instead of creating a substitute list.",
    inputSchema: z.object({
      listId: z.string().uuid(),
      apiIds: z
        .array(z.string().trim().min(1))
        .min(1)
        .max(10)
        .describe("Google Books volume ids to add"),
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

        const added: string[] = [];
        const skipped: string[] = [];

        for (const apiId of apiIds) {
          const book = await ensureBookRecord(ctx.supabase, apiId);

          const { data: existing } = await ctx.supabase
            .from("list_entries")
            .select("id")
            .eq("list_id", list.id)
            .eq("book_id", book.id)
            .maybeSingle();

          if (existing) {
            skipped.push(apiId);
            continue;
          }

          const { error } = await ctx.supabase.from("list_entries").insert({
            list_id: list.id,
            book_id: book.id,
          });

          if (error) {
            skipped.push(apiId);
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
