import { tool } from "ai";
import { z } from "zod";
import {
  collectExcludedApiIds,
  collectExcludedBookKeys,
  collectPreferredLanguages,
  collectTasteAuthors,
  loadAiLibraryLists,
} from "@/src/lib/ai/load-library-lists";
import type { AiToolContext } from "@/src/lib/ai/tool-context";
import { getUserLists } from "@/src/lib/lists/get-user-lists";
import { listNameToReadingStatus } from "@/src/lib/lists/reading-status-map";

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
      "Load this user's shelves with title, authors, genres, tags, language, and short descriptions. Returns tasteAuthors, preferredLanguages, doNotRecommendApiIds, and doNotRecommendBookKeys. Match recommendations to preferredLanguages (usually English). Never recommend excluded titles. Context only — no recommendation cards from this tool.",
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

        const libraryLists = await loadAiLibraryLists(ctx.supabase, filtered);

        return {
          lists: libraryLists,
          tasteAuthors: collectTasteAuthors(libraryLists).slice(0, 12),
          preferredLanguages: collectPreferredLanguages(libraryLists),
          doNotRecommendApiIds: collectExcludedApiIds(libraryLists),
          doNotRecommendBookKeys: collectExcludedBookKeys(libraryLists),
        };
      } catch {
        return { error: "Unable to load your library." };
      }
    },
  });
}
