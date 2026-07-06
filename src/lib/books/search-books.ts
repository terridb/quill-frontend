import type { BookSearchResult } from "@/src/types/book";
import { searchGoogleBooks } from "@/src/lib/books/google-books/search-books";

export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  return searchGoogleBooks(query);
}
