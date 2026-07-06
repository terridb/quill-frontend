import { getBookKind, type BookKind } from "@/src/lib/books/google-books/book-kind";
import { normalizeCategories } from "@/src/lib/books/google-books/normalize-categories";
import {
  type BookExclusion,
  isExcludedVolume,
} from "@/src/lib/books/google-books/book-exclusion";
import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";
import {
  getPopularityScore,
  getRatingsCount,
  isObscureLegacyVolume,
} from "@/src/lib/books/google-books/volume-popularity";

const SUBJECT_MATCH_SCORE = 3;
export const GENRE_MATCH_SCORE = 2;
const MULTI_MATCH_BONUS = 1;
const POPULAR_SPARSE_MIN_RATINGS = 500;

export const DEFAULT_MIN_RELATED_SCORE = 3;

export function getMinRelatedScore(genreLabels: string[]): number {
  if (genreLabels.length >= 2) {
    return DEFAULT_MIN_RELATED_SCORE;
  }
  return genreLabels.length > 0 ? GENRE_MATCH_SCORE : DEFAULT_MIN_RELATED_SCORE;
}

export interface RelatedBookSignals {
  genreLabels: string[];
  subjectTags: string[];
}

export interface RankRelatedVolumesOptions {
  maxResults?: number;
  minScore?: number;
  sourceBookKind?: BookKind;
}

function hasCategoryMetadata(volume: GoogleBooksVolume): boolean {
  const candidate = normalizeCategories(
    volume.volumeInfo.categories,
    volume.volumeInfo.mainCategory,
  );

  return candidate.genreLabels.length > 0 || candidate.subjectTags.length > 0;
}

function hasRelevantCategoryMetadata(
  volume: GoogleBooksVolume,
  source: RelatedBookSignals,
): boolean {
  return hasCategoryMetadata(volume) && scoreRelatedBook(volume, source) > 0;
}

function applySearchContextScore(
  volume: GoogleBooksVolume,
  score: number,
  source: RelatedBookSignals,
  sourceBookKind: BookKind | undefined,
): number {
  if (score >= getMinRelatedScore(source.genreLabels)) {
    return score;
  }

  if (hasRelevantCategoryMetadata(volume, source)) {
    return score;
  }

  if (sourceBookKind !== "fiction" || source.genreLabels.length === 0) {
    return score;
  }

  if (getBookKind(volume) === "nonfiction") {
    return score;
  }

  if (isObscureLegacyVolume(volume)) {
    return score;
  }

  return Math.max(score, getMinRelatedScore(source.genreLabels));
}

function passesMinRelatedScore(
  volume: GoogleBooksVolume,
  relevanceScore: number,
  minScore: number,
  source: RelatedBookSignals,
  sourceBookKind: BookKind | undefined,
): boolean {
  if (relevanceScore >= minScore) {
    return true;
  }

  if (
    minScore > GENRE_MATCH_SCORE &&
    relevanceScore >= GENRE_MATCH_SCORE &&
    sourceBookKind === "fiction" &&
    source.genreLabels.length >= 2 &&
    !hasRelevantCategoryMetadata(volume, source) &&
    !isObscureLegacyVolume(volume) &&
    (getRatingsCount(volume) ?? 0) >= POPULAR_SPARSE_MIN_RATINGS
  ) {
    return true;
  }

  return false;
}

export function hasGenreOverlap(
  volume: GoogleBooksVolume,
  source: RelatedBookSignals,
): boolean {
  if (source.genreLabels.length === 0) {
    return true;
  }

  const candidate = normalizeCategories(
    volume.volumeInfo.categories,
    volume.volumeInfo.mainCategory,
  );

  if (candidate.genreLabels.length === 0) {
    return true;
  }

  const sourceGenres = new Set(source.genreLabels.map((label) => label.toLowerCase()));

  return candidate.genreLabels.some((genre) =>
    sourceGenres.has(genre.toLowerCase()),
  );
}

export function scoreRelatedBook(
  volume: GoogleBooksVolume,
  source: RelatedBookSignals,
): number {
  const candidate = normalizeCategories(
    volume.volumeInfo.categories,
    volume.volumeInfo.mainCategory,
  );
  const sourceGenres = new Set(source.genreLabels.map((label) => label.toLowerCase()));
  const sourceSubjects = new Set(source.subjectTags.map((label) => label.toLowerCase()));

  let score = 0;
  let matchCount = 0;

  for (const genre of candidate.genreLabels) {
    if (sourceGenres.has(genre.toLowerCase())) {
      score += GENRE_MATCH_SCORE;
      matchCount++;
    }
  }

  for (const tag of candidate.subjectTags) {
    if (sourceSubjects.has(tag.toLowerCase())) {
      score += SUBJECT_MATCH_SCORE;
      matchCount++;
    }
  }

  if (matchCount > 1) {
    score += MULTI_MATCH_BONUS;
  }

  return score;
}

export function rankRelatedVolumes(
  volumes: GoogleBooksVolume[],
  source: RelatedBookSignals,
  exclusion: BookExclusion,
  options: RankRelatedVolumesOptions = {},
): GoogleBooksVolume[] {
  const {
    maxResults = 20,
    minScore = DEFAULT_MIN_RELATED_SCORE,
    sourceBookKind,
  } = options;

  return volumes
    .filter((volume) => !isExcludedVolume(volume, exclusion))
    .map((volume) => ({
      volume,
      relevanceScore: applySearchContextScore(
        volume,
        scoreRelatedBook(volume, source),
        source,
        sourceBookKind,
      ),
    }))
    .filter(({ volume, relevanceScore }) => {
      if (!passesMinRelatedScore(volume, relevanceScore, minScore, source, sourceBookKind)) {
        return false;
      }

      return hasGenreOverlap(volume, source);
    })
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }

      return getPopularityScore(b.volume) - getPopularityScore(a.volume);
    })
    .slice(0, maxResults)
    .map(({ volume }) => volume);
}
