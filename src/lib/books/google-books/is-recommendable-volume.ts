import {
  getBookKind,
  matchesBookKind,
  type BookKind,
} from "@/src/lib/books/google-books/book-kind";
import type { BookExclusion } from "@/src/lib/books/google-books/book-exclusion";
import { isExcludedVolume } from "@/src/lib/books/google-books/book-exclusion";
import { isScholarlyOrStudyGuideVolume } from "@/src/lib/books/google-books/is-scholarly-volume";
import {
  isListedBookVolume,
  isUserFacingBook,
} from "@/src/lib/books/google-books/is-user-facing-book";
import { pickCoverUrl } from "@/src/lib/books/google-books/pick-cover-url";
import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

export interface RecommendableVolumeCriteria {
  exclusion: BookExclusion;
  /** ISO 639-1 code from the source book; when set, only matching volumes pass. */
  language: string | null;
  /** Fiction/nonfiction kind of the source book; mismatches are rejected when known. */
  sourceBookKind?: BookKind;
  /** When the source is commercial fiction, block scholarly/study-guide candidates. */
  filterScholarlyForFiction?: boolean;
  requireCover?: boolean;
  /** When true, volumes without language metadata still pass if other criteria match. */
  allowUnknownLanguage?: boolean;
  /** Accept sparse search-listing volumes (no ISBN / printType). */
  allowSearchListings?: boolean;
}

export function normalizeLanguageCode(language: string): string {
  return language.trim().toLowerCase().split("-")[0] ?? language;
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

  return (
    normalizeLanguageCode(candidateLanguage) ===
    normalizeLanguageCode(sourceLanguage)
  );
}

export function isRecommendableVolume(
  volume: GoogleBooksVolume,
  criteria: RecommendableVolumeCriteria,
): boolean {
  const isValidBook = criteria.allowSearchListings
    ? isListedBookVolume(volume) || isUserFacingBook(volume)
    : isUserFacingBook(volume);

  if (!isValidBook) {
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

  const sourceKind = criteria.sourceBookKind;
  if (sourceKind && !matchesBookKind(sourceKind, getBookKind(volume))) {
    return false;
  }

  if (
    criteria.filterScholarlyForFiction &&
    sourceKind === "fiction" &&
    isScholarlyOrStudyGuideVolume(volume)
  ) {
    return false;
  }

  return true;
}
