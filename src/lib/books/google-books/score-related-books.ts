import { normalizeCategories } from "@/src/lib/books/google-books/normalize-categories";
import {
  type BookExclusion,
  isExcludedVolume,
} from "@/src/lib/books/google-books/book-exclusion";
import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

const SUBJECT_MATCH_SCORE = 3;
const GENRE_MATCH_SCORE = 2;
const MULTI_MATCH_BONUS = 1;

export interface RelatedBookSignals {
  genreLabels: string[];
  subjectTags: string[];
}

export function scoreRelatedBook(
  volume: GoogleBooksVolume,
  source: RelatedBookSignals,
): number {
  const candidate = normalizeCategories(volume.volumeInfo.categories);
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
  maxResults = 20,
): GoogleBooksVolume[] {
  const scored = volumes
    .filter((volume) => !isExcludedVolume(volume, exclusion))
    .map((volume) => ({ volume, score: scoreRelatedBook(volume, source) }))
    .sort((a, b) => b.score - a.score);

  const withOverlap = scored.filter(({ score }) => score > 0);

  if (withOverlap.length >= maxResults) {
    return withOverlap.slice(0, maxResults).map(({ volume }) => volume);
  }

  const includedIds = new Set(withOverlap.map(({ volume }) => volume.id));
  const fallback = scored.filter(({ volume, score }) => {
    return score === 0 && !includedIds.has(volume.id);
  });

  return [...withOverlap, ...fallback]
    .slice(0, maxResults)
    .map(({ volume }) => volume);
}
