import type { RelatedBook } from "@/src/types/book";
import { googleBooksFetch } from "@/src/lib/books/google-books/client";
import {
  buildAuthorSearchQueries,
  volumeIncludesAuthor,
} from "@/src/lib/books/google-books/author-matching";
import type { BookExclusion } from "@/src/lib/books/google-books/book-exclusion";
import {
  isRecommendableVolume,
  type RecommendableVolumeCriteria,
} from "@/src/lib/books/google-books/is-recommendable-volume";
import { mapVolumeToRelatedBook } from "@/src/lib/books/google-books/map-volume";
import { dedupeRelatedBooks } from "@/src/lib/books/merge-related-books";
import {
  googleBooksSearchResponseSchema,
  type GoogleBooksVolume,
} from "@/src/lib/books/google-books/schemas";

const PAGE_SIZE = 40;
const MAX_PAGES_PER_QUERY = 3;
const MAX_AUTHOR_BOOKS = 20;

async function fetchAuthorVolumesByQuery(
  query: string,
  language: string | null,
): Promise<GoogleBooksVolume[]> {
  const volumes: GoogleBooksVolume[] = [];
  const seenIds = new Set<string>();

  for (let page = 0; page < MAX_PAGES_PER_QUERY; page++) {
    const params = new URLSearchParams({
      q: query,
      maxResults: String(PAGE_SIZE),
      startIndex: String(page * PAGE_SIZE),
      printType: "books",
      orderBy: "relevance",
    });

    if (language) {
      params.set("langRestrict", language);
    }

    const response = await googleBooksFetch(`/volumes?${params.toString()}`, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      break;
    }

    const json: unknown = await response.json();
    const parsed = googleBooksSearchResponseSchema.safeParse(json);

    if (!parsed.success || !parsed.data.items?.length) {
      break;
    }

    let addedThisPage = 0;

    for (const volume of parsed.data.items) {
      if (seenIds.has(volume.id)) {
        continue;
      }
      seenIds.add(volume.id);
      volumes.push(volume);
      addedThisPage++;
    }

    if (parsed.data.items.length < PAGE_SIZE || addedThisPage === 0) {
      break;
    }
  }

  return volumes;
}

function collectAuthorVolumes(
  volumeGroups: GoogleBooksVolume[][],
): GoogleBooksVolume[] {
  const seenIds = new Set<string>();
  const volumes: GoogleBooksVolume[] = [];

  for (const group of volumeGroups) {
    for (const volume of group) {
      if (seenIds.has(volume.id)) {
        continue;
      }
      seenIds.add(volume.id);
      volumes.push(volume);
    }
  }

  return volumes;
}

export async function fetchAuthorGoogleBooks(
  author: string,
  exclusion: BookExclusion,
  language: string | null,
  maxResults = MAX_AUTHOR_BOOKS,
): Promise<RelatedBook[]> {
  const queries = buildAuthorSearchQueries(author);

  if (queries.length === 0) {
    return [];
  }

  try {
    const volumeGroups = await Promise.all(
      queries.map((query) => fetchAuthorVolumesByQuery(query, language)),
    );
    const candidates = collectAuthorVolumes(volumeGroups);
    const criteria: RecommendableVolumeCriteria = {
      exclusion,
      language,
      allowUnknownLanguage: true,
    };

    const books: RelatedBook[] = [];

    for (const volume of candidates) {
      if (
        !volumeIncludesAuthor(volume, author) ||
        !isRecommendableVolume(volume, criteria)
      ) {
        continue;
      }

      books.push(mapVolumeToRelatedBook(volume));
    }

    return dedupeRelatedBooks(books).slice(0, maxResults);
  } catch {
    return [];
  }
}
