import { cache } from "react";
import type { BookDetail } from "@/src/types/book";
import { getBookByApiId } from "@/src/lib/books/get-book-by-api-id";
import { mapBookRowToBookDetail } from "@/src/lib/books/map-book-row-to-detail";
import type { BookExclusion } from "@/src/lib/books/google-books/book-exclusion";
import { fetchAuthorGoogleBooks } from "@/src/lib/books/google-books/fetch-author-books";
import { fetchGoogleVolume } from "@/src/lib/books/google-books/fetch-google-volume";
import { fetchRelatedGoogleBooks } from "@/src/lib/books/google-books/fetch-related-books";
import { getVolumeLanguage } from "@/src/lib/books/google-books/is-recommendable-volume";
import type { BookKind } from "@/src/lib/books/google-books/book-kind";
import {
  fetchGoogleBookDetail,
  isBookNotFoundError,
} from "@/src/lib/books/google-books/fetch-book-detail";
import { createClient } from "@/src/lib/supabase/server";

function buildExclusion(apiId: string, isbn: string | null): BookExclusion {
  const isbns = new Set<string>();

  if (isbn) {
    isbns.add(isbn.replace(/-/g, "").toUpperCase());
  }

  return { bookId: apiId, isbns };
}

function getBookKindFromGenres(genreLabels: string[]): BookKind {
  const fictionGenres = new Set([
    "Fiction",
    "Fantasy",
    "Science Fiction",
    "Mystery",
    "Thriller",
    "Romance",
    "Horror",
  ]);

  return genreLabels.some((genre) => fictionGenres.has(genre))
    ? "fiction"
    : "nonfiction";
}

async function fetchBookDetailUncached(apiId: string): Promise<BookDetail> {
  const supabase = await createClient();
  const cachedBook = await getBookByApiId(supabase, apiId);

  if (cachedBook) {
    let book = cachedBook;

    if (!book.language) {
      try {
        const volume = await fetchGoogleVolume(apiId);
        const language = getVolumeLanguage(volume);

        if (language) {
          await supabase.from("books").update({ language }).eq("id", book.id);
          book = { ...book, language };
        }
      } catch {
        // Continue without language when Google Books is unavailable.
      }
    }

    const genreLabels = book.genres ?? [];
    const subjectTags = book.tags ?? [];
    const primaryAuthor = book.author?.split(",")[0]?.trim() ?? null;
    const exclusion = buildExclusion(book.api_id, book.isbn);

    const [relatedBooks, authorBooks] = await Promise.all([
      fetchRelatedGoogleBooks({
        genreLabels,
        subjectTags,
        exclusion,
        language: book.language,
        sourceBookKind: getBookKindFromGenres(genreLabels),
        excludeAuthor: primaryAuthor,
      }),
      primaryAuthor
        ? fetchAuthorGoogleBooks(primaryAuthor, exclusion, book.language)
        : Promise.resolve([]),
    ]);

    return mapBookRowToBookDetail(book, relatedBooks, authorBooks);
  }

  return fetchGoogleBookDetail(apiId);
}

export const fetchBookDetail = cache(fetchBookDetailUncached);

export { isBookNotFoundError };
