import { tool } from "ai";
import { z } from "zod";
import type { AiToolContext } from "@/src/lib/ai/tool-context";

export function createGetReadingActivityTool(ctx: AiToolContext) {
  return tool({
    description:
      "Load this user's recent daily reading logs (pages read per day per book). Use for pace and engagement context.",
    inputSchema: z.object({
      days: z
        .number()
        .int()
        .min(1)
        .max(90)
        .optional()
        .describe("How many days back to look. Defaults to 30, max 90."),
    }),
    execute: async ({ days = 30 }) => {
      try {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const sinceDate = since.toISOString().slice(0, 10);

        const { data: logs, error } = await ctx.supabase
          .from("reading_logs")
          .select("id, logged_date, pages_read, list_entry_id")
          .eq("user_id", ctx.userId)
          .gte("logged_date", sinceDate)
          .order("logged_date", { ascending: false })
          .limit(100);

        if (error || !logs) {
          return { error: "Unable to load reading activity." };
        }

        if (logs.length === 0) {
          return { days, logs: [] };
        }

        const entryIds = [
          ...new Set(
            logs
              .map((log) => log.list_entry_id)
              .filter((id): id is string => id !== null),
          ),
        ];
        const { data: entries } =
          entryIds.length > 0
            ? await ctx.supabase
                .from("list_entries")
                .select("id, book_id")
                .in("id", entryIds)
            : { data: [] as { id: string; book_id: string }[] };

        const bookIds = [
          ...new Set((entries ?? []).map((entry) => entry.book_id)),
        ];
        const { data: books } = bookIds.length
          ? await ctx.supabase
              .from("books")
              .select("id, api_id, title, author")
              .in("id", bookIds)
          : { data: [] as { id: string; api_id: string; title: string; author: string | null }[] };

        const bookById = new Map((books ?? []).map((book) => [book.id, book]));
        const bookIdByEntryId = new Map(
          (entries ?? []).map((entry) => [entry.id, entry.book_id]),
        );

        return {
          days,
          logs: logs.map((log) => {
            const bookId = bookIdByEntryId.get(log.list_entry_id);
            const book = bookId ? bookById.get(bookId) : undefined;
            return {
              loggedDate: log.logged_date,
              pagesRead: log.pages_read,
              apiId: book?.api_id ?? null,
              title: book?.title ?? null,
              authors: book?.author ?? null,
            };
          }),
        };
      } catch {
        return { error: "Unable to load reading activity." };
      }
    },
  });
}
