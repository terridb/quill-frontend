import { tool } from "ai";
import { z } from "zod";
import { getListBooks } from "@/src/lib/lists/get-list-books";
import { getUserLists } from "@/src/lib/lists/get-user-lists";
import type { AiToolContext } from "@/src/lib/ai/tool-context";

export function createGetListBooksTool(ctx: AiToolContext) {
  return tool({
    description:
      "Load books on one of this user's lists by list id or exact list name.",
    inputSchema: z.object({
      listId: z
        .string()
        .uuid()
        .optional()
        .describe("List UUID. Provide listId or listName."),
      listName: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional()
        .describe("Exact list name. Provide listId or listName."),
    }),
    execute: async ({ listId, listName }) => {
      if (!listId && !listName) {
        return { error: "Provide listId or listName." };
      }

      try {
        const lists = await getUserLists(ctx.supabase, ctx.userId);
        const list = listId
          ? lists.find((item) => item.id === listId)
          : lists.find(
              (item) =>
                item.name.toLowerCase() === listName!.trim().toLowerCase(),
            );

        if (!list) {
          return { error: "List not found in your library." };
        }

        const books = await getListBooks(ctx.supabase, list.id);

        return {
          id: list.id,
          name: list.name,
          isDefault: list.isDefault,
          books: books.map((book) => ({
            apiId: book.bookId,
            title: book.title,
            authors: book.authors,
            coverUrl: book.coverUrl,
          })),
        };
      } catch {
        return { error: "Unable to load that list." };
      }
    },
  });
}
