import type { BookSearchResult } from "@/src/types/book";
import { searchGoogleBooks } from "@/src/lib/books/google-books/search-books";
import { searchSupabaseBooks } from "@/src/lib/books/search-supabase-books";
import { createClient } from "@/src/lib/supabase/server";

const RESULT_LIMIT = 20;

export function mergeSearchResults(
  local: BookSearchResult[],
  remote: BookSearchResult[],
  limit = RESULT_LIMIT,
): BookSearchResult[] {
  const seen = new Set(local.map((book) => book.bookId));

  if (local.length >= limit) {
    return local;
  }

  const fill = remote
    .filter((book) => !seen.has(book.bookId))
    .slice(0, limit - local.length);

  return [...local, ...fill];
}

export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  const supabase = await createClient();
  const local = await searchSupabaseBooks(supabase, query, RESULT_LIMIT);
  const remote = await searchGoogleBooks(query);

  return mergeSearchResults(local, remote);
}
