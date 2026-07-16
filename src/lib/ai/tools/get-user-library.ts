import { tool } from "ai";
import { z } from "zod";
import { getListBooks } from "@/src/lib/lists/get-list-books";
import { getUserLists } from "@/src/lib/lists/get-user-lists";
import { listNameToReadingStatus } from "@/src/lib/lists/reading-status-map";
import type { AiToolContext } from "@/src/lib/ai/tool-context";

const listFilterSchema = z.enum([
  "all",
  "want_to_read",
  "currently_reading",
  "finished",
  "did_not_finish",
  "custom",
]);

export function createGetUserLibraryTool(ctx: AiToolContext) {
  return tool({
    description:
      "Load this user's lists and the books on them. Use to learn reading taste, status, and what they already own.",
    inputSchema: z.object({
      listFilter: listFilterSchema
        .optional()
        .describe(
          "Filter which lists to include. Defaults to all. Use custom for non-default lists only.",
        ),
    }),
    execute: async ({ listFilter = "all" }) => {
      try {
        const lists = await getUserLists(ctx.supabase, ctx.userId);

        const filtered = lists.filter((list) => {
          if (listFilter === "all") {
            return true;
          }
          if (listFilter === "custom") {
            return !list.isDefault;
          }
          const status = listNameToReadingStatus(list.name);
          return status === listFilter;
        });

        const listsWithBooks = await Promise.all(
          filtered.map(async (list) => {
            const books = await getListBooks(ctx.supabase, list.id);
            return {
              id: list.id,
              name: list.name,
              isDefault: list.isDefault,
              isPrivate: list.isPrivate,
              books: books.map((book) => ({
                apiId: book.bookId,
                title: book.title,
                authors: book.authors,
                coverUrl: book.coverUrl,
              })),
            };
          }),
        );

        return { lists: listsWithBooks };
      } catch {
        return { error: "Unable to load your library." };
      }
    },
  });
}
