import type { RelatedBook } from "@/src/types/book";
import type { BookKind } from "@/src/lib/books/google-books/book-kind";
import { volumeIncludesAuthor } from "@/src/lib/books/google-books/author-matching";
import { googleBooksFetch } from "@/src/lib/books/google-books/client";
import type { BookExclusion } from "@/src/lib/books/google-books/book-exclusion";
import {
  isRecommendableVolume,
  type RecommendableVolumeCriteria,
} from "@/src/lib/books/google-books/is-recommendable-volume";
import { mapVolumeToRelatedBook } from "@/src/lib/books/google-books/map-volume";
import { buildRelatedBookSearchQueries } from "@/src/lib/books/google-books/normalize-categories";
import {
  getMinRelatedScore,
  rankRelatedVolumes,
  type RelatedBookSignals,
} from "@/src/lib/books/google-books/score-related-books";
import {
  googleBooksSearchResponseSchema,
  type GoogleBooksVolume,
} from "@/src/lib/books/google-books/schemas";
import { dedupeRelatedBooks } from "@/src/lib/books/merge-related-books";

const PAGE_SIZE = 40;
const MAX_PAGES_PER_QUERY = 3;
const MAX_RELATED = 20;

export interface FetchRelatedGoogleBooksOptions extends RelatedBookSignals {
  exclusion: BookExclusion;
  language: string | null;
  sourceBookKind: BookKind;
  /** Omit same-author works; those belong in the author carousel. */
  excludeAuthor?: string | null;
}

async function fetchVolumesByQuery(
  query: string,
  language: string | null,
): Promise<GoogleBooksVolume[]> {
  const volumes: GoogleBooksVolume[] = [];
  const seenIds = new Set<string>();

  try {
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
  } catch {
    return [];
  }
}

function collectUniqueVolumes(
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

export async function fetchRelatedGoogleBooks({
  genreLabels,
  subjectTags,
  exclusion,
  language,
  sourceBookKind,
  excludeAuthor = null,
}: FetchRelatedGoogleBooksOptions): Promise<RelatedBook[]> {
  const queries = buildRelatedBookSearchQueries(genreLabels, subjectTags, {
    bookKind: sourceBookKind,
  });

  if (queries.length === 0) {
    return [];
  }

  const isCommercialFiction =
    sourceBookKind === "fiction" && genreLabels.length > 0;

  const criteria: RecommendableVolumeCriteria = {
    exclusion,
    language,
    sourceBookKind,
    filterScholarlyForFiction: isCommercialFiction,
    allowUnknownLanguage: true,
    allowSearchListings: true,
  };

  const volumeGroups = await Promise.all(
    queries.map((query) => fetchVolumesByQuery(query, language)),
  );
  const candidates = collectUniqueVolumes(volumeGroups)
    .filter((volume) => isRecommendableVolume(volume, criteria))
    .filter(
      (volume) =>
        !excludeAuthor || !volumeIncludesAuthor(volume, excludeAuthor),
    );
  const ranked = rankRelatedVolumes(
    candidates,
    { genreLabels, subjectTags },
    exclusion,
    {
      maxResults: MAX_RELATED,
      minScore: getMinRelatedScore(genreLabels),
      sourceBookKind,
    },
  );

  return dedupeRelatedBooks(
    ranked
      .filter((volume) => isRecommendableVolume(volume, criteria))
      .map(mapVolumeToRelatedBook),
  ).slice(0, MAX_RELATED);
}
