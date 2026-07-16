import { cache } from "react";
import type { BookDetail } from "@/src/types/book";
import { googleBooksFetch } from "@/src/lib/books/google-books/client";
import { fetchAuthorGoogleBooks } from "@/src/lib/books/google-books/fetch-author-books";
import { getBookExclusion } from "@/src/lib/books/google-books/book-exclusion";
import { fetchRelatedGoogleBooks } from "@/src/lib/books/google-books/fetch-related-books";
import { getBookKind } from "@/src/lib/books/google-books/book-kind";
import { getVolumeLanguage } from "@/src/lib/books/google-books/is-recommendable-volume";
import { isListedBookVolume } from "@/src/lib/books/google-books/is-user-facing-book";
import {
  mapVolumeToBookDetail,
} from "@/src/lib/books/google-books/map-volume";
import { normalizeCategories } from "@/src/lib/books/google-books/normalize-categories";
import { googleBooksVolumeSchema } from "@/src/lib/books/google-books/schemas";

class BookNotFoundError extends Error {
  constructor(bookId: string) {
    super(`Book not found: ${bookId}`);
    this.name = "BookNotFoundError";
  }
}

async function fetchGoogleBookDetailUncached(bookId: string): Promise<BookDetail> {
  let response: Response;

  try {
    response = await googleBooksFetch(`/volumes/${encodeURIComponent(bookId)}`, {
      next: { revalidate: 86400 },
    });
  } catch {
    throw new Error("Unable to reach Google Books");
  }

  if (response.status === 404) {
    throw new BookNotFoundError(bookId);
  }

  if (!response.ok) {
    throw new Error(`Google Books request failed with status ${response.status}`);
  }

  const json: unknown = await response.json();
  const parsed = googleBooksVolumeSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error("Invalid volume response from Google Books");
  }

  // Match search listing rules: Google often omits ISBN on otherwise valid books.
  if (!isListedBookVolume(parsed.data)) {
    throw new BookNotFoundError(bookId);
  }

  const { genreLabels, subjectTags } = normalizeCategories(
    parsed.data.volumeInfo.categories,
    parsed.data.volumeInfo.mainCategory,
  );
  const primaryAuthor = parsed.data.volumeInfo.authors?.[0];
  const exclusion = getBookExclusion(parsed.data);
  const language = getVolumeLanguage(parsed.data);
  const sourceBookKind = getBookKind(parsed.data);

  const [relatedBooks, authorBooks] = await Promise.all([
    fetchRelatedGoogleBooks({
      genreLabels,
      subjectTags,
      exclusion,
      language,
      sourceBookKind,
      excludeAuthor: primaryAuthor ?? null,
    }),
    primaryAuthor
      ? fetchAuthorGoogleBooks(primaryAuthor, exclusion, language)
      : Promise.resolve([]),
  ]);

  return mapVolumeToBookDetail(parsed.data, relatedBooks, authorBooks);
}

export const fetchGoogleBookDetail = cache(fetchGoogleBookDetailUncached);

export function isBookNotFoundError(error: unknown): error is BookNotFoundError {
  return error instanceof BookNotFoundError;
}
