import type {
  BookSearchResponse,
  BookSearchResult,
} from "@/src/types/open-library";

export async function fetchBookSearch(query: string): Promise<BookSearchResult[]> {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`/api/books/search?${params.toString()}`);

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Search request failed");
  }

  const data = (await response.json()) as BookSearchResponse;
  return data.results;
}
