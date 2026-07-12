import type { BookSearchResult } from "@/src/types/book";
import { googleBooksFetch } from "@/src/lib/books/google-books/client";
import { isListedBookVolume } from "@/src/lib/books/google-books/is-user-facing-book";
import { mapVolumeToSearchResult } from "@/src/lib/books/google-books/map-volume";
import {
  googleBooksVolumeSchema,
  type GoogleBooksVolume,
} from "@/src/lib/books/google-books/schemas";

const RESULT_LIMIT = 20;
const FETCH_LIMIT = 40;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 300;
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 200;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

const searchCache = new Map<
  string,
  { results: BookSearchResult[]; expiresAt: number }
>();

function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

function getCachedSearchResults(
  query: string,
  allowStale = false,
): BookSearchResult[] | null {
  const key = normalizeSearchQuery(query);
  const entry = searchCache.get(key);

  if (!entry) {
    return null;
  }

  if (!allowStale && entry.expiresAt < Date.now()) {
    searchCache.delete(key);
    return null;
  }

  return entry.results;
}

function setCachedSearchResults(query: string, results: BookSearchResult[]) {
  if (results.length === 0) {
    return;
  }

  const key = normalizeSearchQuery(query);

  if (searchCache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = searchCache.keys().next().value;
    if (oldestKey) {
      searchCache.delete(oldestKey);
    }
  }

  searchCache.set(key, {
    results,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function parseGoogleBooksSearchVolumes(json: unknown): GoogleBooksVolume[] {
  if (!json || typeof json !== "object" || !("items" in json)) {
    return [];
  }

  const items = (json as { items?: unknown }).items;

  if (!Array.isArray(items)) {
    return [];
  }

  return items.flatMap((item) => {
    const parsed = googleBooksVolumeSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function mapGoogleBooksSearchVolumes(
  volumes: GoogleBooksVolume[],
  limit = RESULT_LIMIT,
): BookSearchResult[] {
  return volumes
    .filter(isListedBookVolume)
    .slice(0, limit)
    .map(mapVolumeToSearchResult);
}

async function fetchGoogleBooksSearchResponse(
  query: string,
): Promise<Response | null> {
  const params = new URLSearchParams({
    q: query,
    maxResults: String(FETCH_LIMIT),
    printType: "books",
  });

  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await sleep(RETRY_DELAY_MS * attempt);
    }

    try {
      const response = await googleBooksFetch(`/volumes?${params.toString()}`, {
        next: { revalidate: 300 },
      });

      if (response.ok) {
        return response;
      }

      lastResponse = response;

      if (!RETRYABLE_STATUSES.has(response.status)) {
        break;
      }
    } catch (error) {
      console.warn("Google Books search request failed:", error);
      lastResponse = null;
    }
  }

  return lastResponse;
}

export async function searchGoogleBooks(query: string): Promise<BookSearchResult[]> {
  const cached = getCachedSearchResults(query);
  if (cached) {
    return cached;
  }

  const response = await fetchGoogleBooksSearchResponse(query);

  if (!response?.ok) {
    console.warn(
      `Google Books search failed with status ${response?.status ?? "network error"} for query "${query}"`,
    );
    return getCachedSearchResults(query, true) ?? [];
  }

  const json: unknown = await response.json();
  const results = mapGoogleBooksSearchVolumes(parseGoogleBooksSearchVolumes(json));

  if (results.length > 0) {
    setCachedSearchResults(query, results);
  }

  return results;
}
