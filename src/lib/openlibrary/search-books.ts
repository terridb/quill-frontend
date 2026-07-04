import type { BookSearchResult } from "@/src/types/open-library";
import { extractOpenLibraryId } from "@/src/lib/openlibrary/book-path";
import { getCoverUrl } from "@/src/lib/openlibrary/cover-url";
import { openLibrarySearchResponseSchema } from "@/src/lib/openlibrary/schemas";

const OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json";
const RESULT_LIMIT = 20;

export async function searchOpenLibraryBooks(
  query: string,
): Promise<BookSearchResult[]> {
  const url = new URL(OPEN_LIBRARY_SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(RESULT_LIMIT));
  url.searchParams.set("fields", "key,title,author_name,cover_i");

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Open Library request failed with status ${response.status}`);
  }

  const json: unknown = await response.json();
  const parsed = openLibrarySearchResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error("Invalid response from Open Library");
  }

  return parsed.data.docs.map((doc) => ({
    id: doc.key,
    openLibraryId: extractOpenLibraryId(doc.key),
    title: doc.title ?? "Untitled",
    authors: doc.author_name?.join(", ") ?? "Unknown author",
    coverUrl: getCoverUrl(doc.cover_i),
  }));
}
