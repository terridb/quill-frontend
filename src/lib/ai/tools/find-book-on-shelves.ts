import { tool } from "ai";
import { z } from "zod";
import {
  bookIdentityKey,
  normalizeBookTitle,
} from "@/src/lib/ai/book-identity";
import { loadAiLibraryLists } from "@/src/lib/ai/load-library-lists";
import type { AiToolContext } from "@/src/lib/ai/tool-context";
import { getUserLists } from "@/src/lib/lists/get-user-lists";

type ShelfHit = {
  listId: string;
  listName: string;
  readingStatus: string | null;
  apiId: string;
  title: string;
  authors: string;
};

/**
 * Exact shelf membership for a catalog book. Use before claiming a title is
 * already on Want To Read (or any list) — never invent membership from memory.
 */
export function createFindBookOnShelvesTool(ctx: AiToolContext) {
  return tool({
    description:
      "Check whether a book is already on this user's shelves. Pass apiId and/or title (+ optional authors). Returns exact list matches and optional title+author identity matches. Call this before telling the user a book is already on Want To Read or any other list. doNotRecommendApiIds alone is not proof of Want To Read membership.",
    inputSchema: z.object({
      apiId: z
        .string()
        .trim()
        .min(1)
        .optional()
        .describe("Google Books volume id when known"),
      title: z
        .string()
        .trim()
        .min(1)
        .max(200)
        .optional()
        .describe("Book title to look up when apiId is unknown"),
      authors: z
        .string()
        .trim()
        .min(1)
        .max(200)
        .optional()
        .describe("Author string for tighter identity matching"),
    }),
    execute: async ({ apiId, title, authors }) => {
      if (!apiId && !title) {
        return { error: "Provide apiId or title." };
      }

      try {
        const lists = await getUserLists(ctx.supabase, ctx.userId);
        const libraryLists = await loadAiLibraryLists(ctx.supabase, lists);

        const byApiId: ShelfHit[] = [];
        const byIdentity: ShelfHit[] = [];

        const identityKey =
          title && authors ? bookIdentityKey(authors, title) : null;
        const titleKey = title ? normalizeBookTitle(title) : null;

        for (const list of libraryLists) {
          for (const book of list.books) {
            const hit: ShelfHit = {
              listId: list.id,
              listName: list.name,
              readingStatus: list.readingStatus,
              apiId: book.apiId,
              title: book.title,
              authors: book.authors,
            };

            if (apiId && book.apiId === apiId) {
              byApiId.push(hit);
            }

            if (identityKey) {
              if (bookIdentityKey(book.authors, book.title) === identityKey) {
                byIdentity.push(hit);
              }
            } else if (titleKey && normalizeBookTitle(book.title) === titleKey) {
              byIdentity.push(hit);
            }
          }
        }

        const apiIdHitKeys = new Set(
          byApiId.map((hit) => `${hit.listId}:${hit.apiId}`),
        );
        const identityOnly = byIdentity.filter(
          (hit) => !apiIdHitKeys.has(`${hit.listId}:${hit.apiId}`),
        );

        const allHits = [...byApiId, ...identityOnly];

        return {
          queried: {
            apiId: apiId ?? null,
            title: title ?? null,
            authors: authors ?? null,
          },
          matchesByApiId: byApiId,
          matchesByTitleAuthor: identityOnly,
          onWantToRead: allHits.some(
            (hit) => hit.readingStatus === "want_to_read",
          ),
          onAnyShelf: allHits.length > 0,
        };
      } catch {
        return { error: "Unable to check your shelves for that book." };
      }
    },
  });
}
