import type { BookExclusion } from "@/src/lib/books/google-books/book-exclusion";
import { isExcludedVolume } from "@/src/lib/books/google-books/book-exclusion";
import { isUserFacingBook } from "@/src/lib/books/google-books/is-user-facing-book";
import { pickCoverUrl } from "@/src/lib/books/google-books/pick-cover-url";
import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

export interface RecommendableVolumeCriteria {
  exclusion: BookExclusion;
  /** ISO 639-1 code from the source book; when set, only matching volumes pass. */
  language: string | null;
  requireCover?: boolean;
  /** When true, volumes without language metadata still pass if other criteria match. */
  allowUnknownLanguage?: boolean;
}

export function getVolumeLanguage(volume: GoogleBooksVolume): string | null {
  const language = volume.volumeInfo.language?.trim().toLowerCase();
  return language || null;
}

export function hasVolumeCover(volume: GoogleBooksVolume): boolean {
  return pickCoverUrl(volume.volumeInfo.imageLinks) !== null;
}

export function matchesVolumeLanguage(
  volume: GoogleBooksVolume,
  sourceLanguage: string | null,
  allowUnknown = false,
): boolean {
  if (!sourceLanguage) {
    return true;
  }

  const candidateLanguage = getVolumeLanguage(volume);
  if (!candidateLanguage) {
    return allowUnknown;
  }

  return candidateLanguage === sourceLanguage;
}

export function isRecommendableVolume(
  volume: GoogleBooksVolume,
  criteria: RecommendableVolumeCriteria,
): boolean {
  if (!isUserFacingBook(volume)) {
    return false;
  }

  if (isExcludedVolume(volume, criteria.exclusion)) {
    return false;
  }

  if (!matchesVolumeLanguage(volume, criteria.language, criteria.allowUnknownLanguage)) {
    return false;
  }

  if (criteria.requireCover !== false && !hasVolumeCover(volume)) {
    return false;
  }

  return true;
}
