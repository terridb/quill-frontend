import { tool } from "ai";
import { z } from "zod";
import { bookIdentityKey } from "@/src/lib/ai/book-identity";
import { mergeSearchResults } from "@/src/lib/books/search-books";
import { searchGoogleBooks } from "@/src/lib/books/google-books/search-books";
import { searchSupabaseBooks } from "@/src/lib/books/search-supabase-books";
import type { AiToolContext } from "@/src/lib/ai/tool-context";

function primaryLanguage(code: string): string {
  return code.trim().toLowerCase().split("-")[0] ?? code;
}

export function createSearchBooksTool(ctx: AiToolContext) {
  return tool({
    description:
      'Search for NEW catalog books. For recommendations, search each tasteAuthors entry as inauthor:"Full Author Name", pass preferredLanguages[0] as language (e.g. "en"), and always pass doNotRecommendApiIds plus doNotRecommendBookKeys. Prefer author/series queries over vague genre-only queries.',
    inputSchema: z.object({
      query: z.string().trim().min(1).max(200),
      maxResults: z
        .number()
        .int()
        .min(1)
        .max(10)
        .optional()
        .describe("Max results to return. Defaults to 8, max 10."),
      language: z
        .string()
        .trim()
        .min(2)
        .max(16)
        .optional()
        .describe(
          'ISO 639-1 code from preferredLanguages, e.g. "en". Restricts Google Books and filters results.',
        ),
      excludeApiIds: z
        .array(z.string().trim().min(1))
        .max(500)
        .optional()
        .describe("Pass doNotRecommendApiIds from get_user_library."),
      excludeBookKeys: z
        .array(z.string().trim().min(1))
        .max(500)
        .optional()
        .describe(
          "Pass doNotRecommendBookKeys from get_user_library to skip other editions of owned titles.",
        ),
    }),
    execute: async ({
      query,
      maxResults = 8,
      language,
      excludeApiIds,
      excludeBookKeys,
    }) => {
      try {
        const limit = Math.min(maxResults, 10);
        const lang = language ? primaryLanguage(language) : null;
        const excludeIds = new Set(excludeApiIds ?? []);
        const excludeKeys = new Set(excludeBookKeys ?? []);
        const fetchLimit = Math.min(
          Math.max(limit * 3, limit + excludeIds.size),
          40,
        );

        const [local, remote] = await Promise.all([
          searchSupabaseBooks(ctx.supabase, query, fetchLimit),
          searchGoogleBooks(query, { language: lang }),
        ]);

        const results = mergeSearchResults(local, remote, fetchLimit)
          .filter((book) => {
            if (excludeIds.has(book.bookId)) {
              return false;
            }
            if (
              excludeKeys.size > 0 &&
              excludeKeys.has(bookIdentityKey(book.authors, book.title))
            ) {
              return false;
            }
            if (lang && book.language) {
              return primaryLanguage(book.language) === lang;
            }
            // When restricting language, drop unknown-language local hits that
            // often include translations without metadata.
            if (lang && !book.language) {
              return false;
            }
            return true;
          })
          .slice(0, limit)
          .map((book) => ({
            apiId: book.bookId,
            title: book.title,
            authors: book.authors,
            coverUrl: book.coverUrl,
            language: book.language,
          }));

        return { query, language: lang, results };
      } catch {
        return { error: "Unable to search books right now." };
      }
    },
  });
}
