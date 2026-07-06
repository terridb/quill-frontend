import { cache } from "react";
import type { BookDetail } from "@/src/types/book";
import { googleBooksFetch } from "@/src/lib/books/google-books/client";
import { fetchRelatedGoogleBooks } from "@/src/lib/books/google-books/fetch-related-books";
import { isUserFacingBook } from "@/src/lib/books/google-books/is-user-facing-book";
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

  if (!isUserFacingBook(parsed.data)) {
    throw new BookNotFoundError(bookId);
  }

  const { genreLabels } = normalizeCategories(parsed.data.volumeInfo.categories);
  const relatedBooks = await fetchRelatedGoogleBooks(genreLabels, bookId);

  return mapVolumeToBookDetail(parsed.data, relatedBooks);
}

export const fetchGoogleBookDetail = cache(fetchGoogleBookDetailUncached);

export function isBookNotFoundError(error: unknown): error is BookNotFoundError {
  return error instanceof BookNotFoundError;
}
