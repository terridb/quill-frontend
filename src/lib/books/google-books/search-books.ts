import type { BookSearchResult } from "@/src/types/book";
import { googleBooksFetch } from "@/src/lib/books/google-books/client";
import { isUserFacingBook } from "@/src/lib/books/google-books/is-user-facing-book";
import { mapVolumeToSearchResult } from "@/src/lib/books/google-books/map-volume";
import { googleBooksSearchResponseSchema } from "@/src/lib/books/google-books/schemas";

const RESULT_LIMIT = 20;
const FETCH_LIMIT = 40;

export async function searchGoogleBooks(query: string): Promise<BookSearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    maxResults: String(FETCH_LIMIT),
    printType: "books",
  });

  let response: Response;

  try {
    response = await googleBooksFetch(`/volumes?${params.toString()}`);
  } catch {
    throw new Error("Unable to reach Google Books");
  }

  if (!response.ok) {
    throw new Error(`Google Books request failed with status ${response.status}`);
  }

  const json: unknown = await response.json();
  const parsed = googleBooksSearchResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error("Invalid response from Google Books");
  }

  return (parsed.data.items ?? [])
    .filter(isUserFacingBook)
    .slice(0, RESULT_LIMIT)
    .map(mapVolumeToSearchResult);
}
