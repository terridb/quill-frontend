import { tool } from "ai";
import { z } from "zod";
import { mergeSearchResults } from "@/src/lib/books/search-books";
import { searchGoogleBooks } from "@/src/lib/books/google-books/search-books";
import { searchSupabaseBooks } from "@/src/lib/books/search-supabase-books";
import type { AiToolContext } from "@/src/lib/ai/tool-context";

export function createSearchBooksTool(ctx: AiToolContext) {
  return tool({
    description:
      "Search for books by title, author, or topic using the Quill catalog and Google Books. Returns apiId values for follow-up detail or shelf tools.",
    inputSchema: z.object({
      query: z.string().trim().min(1).max(200),
      maxResults: z
        .number()
        .int()
        .min(1)
        .max(10)
        .optional()
        .describe("Max results to return. Defaults to 8, max 10."),
    }),
    execute: async ({ query, maxResults = 8 }) => {
      try {
        const limit = Math.min(maxResults, 10);
        const [local, remote] = await Promise.all([
          searchSupabaseBooks(ctx.supabase, query, limit),
          searchGoogleBooks(query),
        ]);
        const results = mergeSearchResults(local, remote, limit).map((book) => ({
          apiId: book.bookId,
          title: book.title,
          authors: book.authors,
          coverUrl: book.coverUrl,
          language: book.language,
        }));

        return { query, results };
      } catch {
        return { error: "Unable to search books right now." };
      }
    },
  });
}
