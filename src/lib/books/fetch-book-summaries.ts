import { cache } from "react";
import type { RelatedBook } from "@/src/types/book";
import { googleBooksFetch } from "@/src/lib/books/google-books/client";
import { mapVolumeToRelatedBook } from "@/src/lib/books/google-books/map-volume";
import { googleBooksVolumeSchema } from "@/src/lib/books/google-books/schemas";

async function fetchBookSummaryUncached(
  apiId: string,
): Promise<RelatedBook | null> {
  try {
    const response = await googleBooksFetch(
      `/volumes/${encodeURIComponent(apiId)}`,
      { next: { revalidate: 86400 } },
    );

    if (!response.ok) {
      return null;
    }

    const json: unknown = await response.json();
    const parsed = googleBooksVolumeSchema.safeParse(json);

    if (!parsed.success) {
      return null;
    }

    return mapVolumeToRelatedBook(parsed.data);
  } catch {
    return null;
  }
}

const fetchBookSummary = cache(fetchBookSummaryUncached);

export async function fetchBookSummaries(
  apiIds: string[],
): Promise<Map<string, RelatedBook>> {
  const uniqueIds = [...new Set(apiIds)];

  const pairs = await Promise.all(
    uniqueIds.map(async (apiId) => {
      const book = await fetchBookSummary(apiId);
      return book ? ([apiId, book] as const) : null;
    }),
  );

  return new Map(
    pairs.filter((pair): pair is [string, RelatedBook] => pair !== null),
  );
}
