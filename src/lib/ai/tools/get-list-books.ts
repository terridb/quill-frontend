import { tool } from "ai";
import { z } from "zod";
import { loadAiLibraryLists } from "@/src/lib/ai/load-library-lists";
import type { AiToolContext } from "@/src/lib/ai/tool-context";
import { getUserLists } from "@/src/lib/lists/get-user-lists";

export function createGetListBooksTool(ctx: AiToolContext) {
  return tool({
    description:
      "Load books on one of this user's lists by list id or exact list name, including genres, tags, and short descriptions. Context only — not for recommendation cards.",
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

        const [loaded] = await loadAiLibraryLists(ctx.supabase, [list]);

        return loaded;
      } catch {
        return { error: "Unable to load that list." };
      }
    },
  });
}
