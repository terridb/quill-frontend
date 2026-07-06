import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

export function getRatingsCount(volume: GoogleBooksVolume): number | null {
  const count = volume.volumeInfo.ratingsCount;
  return typeof count === "number" && count > 0 ? count : null;
}

export function getAverageRating(volume: GoogleBooksVolume): number | null {
  const rating = volume.volumeInfo.averageRating;
  return typeof rating === "number" && rating > 0 ? rating : null;
}

export function getPublicationYear(volume: GoogleBooksVolume): number | null {
  const raw = volume.volumeInfo.publishedDate?.trim();
  if (!raw) {
    return null;
  }

  const year = Number.parseInt(raw.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

/** Higher is better; used as a tiebreaker after category relevance. */
export function getPopularityScore(volume: GoogleBooksVolume): number {
  const ratingsCount = getRatingsCount(volume) ?? 0;
  const averageRating = getAverageRating(volume) ?? 0;
  const year = getPublicationYear(volume);

  let score = Math.log10(ratingsCount + 1) * 100;

  if (averageRating > 0) {
    score += averageRating * 10;
  }

  if (year && year >= 2010) {
    score += 15;
  }

  return score;
}

/** Filter obscure legacy titles that only match broad subject metadata. */
export function isObscureLegacyVolume(volume: GoogleBooksVolume): boolean {
  const year = getPublicationYear(volume);
  const ratingsCount = getRatingsCount(volume) ?? 0;

  if (!year || year >= 2000) {
    return false;
  }

  return ratingsCount < 25;
}
