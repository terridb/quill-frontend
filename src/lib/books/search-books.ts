import type { BookSearchResult } from "@/src/types/book";
import { bookIdentityKey } from "@/src/lib/ai/book-identity";
import { searchGoogleBooks } from "@/src/lib/books/google-books/search-books";
import { searchSupabaseBooks } from "@/src/lib/books/search-supabase-books";
import { createClient } from "@/src/lib/supabase/server";

const RESULT_LIMIT = 20;

/**
 * Merge catalog + Google results so fuzzy local hits cannot crowd out
 * exact remote matches (e.g. a title not yet in Supabase).
 *
 * Round-robins remote-first, deduping by api id and title+author identity.
 */
export function mergeSearchResults(
  local: BookSearchResult[],
  remote: BookSearchResult[],
  limit = RESULT_LIMIT,
): BookSearchResult[] {
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const localKeys = new Set(
    local.map((book) => bookIdentityKey(book.authors, book.title)),
  );
  const merged: BookSearchResult[] = [];

  function tryAdd(book: BookSearchResult, fromRemote: boolean): boolean {
    if (merged.length >= limit) {
      return false;
    }
    if (seenIds.has(book.bookId)) {
      return false;
    }
    const key = bookIdentityKey(book.authors, book.title);
    if (seenKeys.has(key)) {
      return false;
    }
    // Prefer the catalog edition when both sources have the same work.
    if (fromRemote && localKeys.has(key)) {
      return false;
    }
    seenIds.add(book.bookId);
    seenKeys.add(key);
    merged.push(book);
    return true;
  }

  let localIndex = 0;
  let remoteIndex = 0;

  while (
    merged.length < limit &&
    (localIndex < local.length || remoteIndex < remote.length)
  ) {
    if (remoteIndex < remote.length) {
      tryAdd(remote[remoteIndex]!, true);
      remoteIndex += 1;
    }
    if (merged.length >= limit) {
      break;
    }
    if (localIndex < local.length) {
      tryAdd(local[localIndex]!, false);
      localIndex += 1;
    }
  }

  return merged;
}

export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  const supabase = await createClient();
  const [local, remote] = await Promise.all([
    searchSupabaseBooks(supabase, query, RESULT_LIMIT),
    searchGoogleBooks(query),
  ]);

  return mergeSearchResults(local, remote);
}
