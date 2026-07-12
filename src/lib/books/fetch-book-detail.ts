import { cache } from "react";
import type { BookDetail } from "@/src/types/book";
import { getBookByApiId } from "@/src/lib/books/get-book-by-api-id";
import { mapBookRowToBookDetail } from "@/src/lib/books/map-book-row-to-detail";
import type { BookExclusion } from "@/src/lib/books/google-books/book-exclusion";
import { fetchAuthorGoogleBooks } from "@/src/lib/books/google-books/fetch-author-books";
import { fetchRelatedGoogleBooks } from "@/src/lib/books/google-books/fetch-related-books";
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
    const genreLabels = cachedBook.genres ?? [];
    const subjectTags = cachedBook.tags ?? [];
    const primaryAuthor = cachedBook.author?.split(",")[0]?.trim() ?? null;
    const exclusion = buildExclusion(cachedBook.api_id, cachedBook.isbn);

    const [relatedBooks, authorBooks] = await Promise.all([
      fetchRelatedGoogleBooks({
        genreLabels,
        subjectTags,
        exclusion,
        language: null,
        sourceBookKind: getBookKindFromGenres(genreLabels),
        excludeAuthor: primaryAuthor,
      }),
      primaryAuthor
        ? fetchAuthorGoogleBooks(primaryAuthor, exclusion, null)
        : Promise.resolve([]),
    ]);

    return mapBookRowToBookDetail(cachedBook, relatedBooks, authorBooks);
  }

  return fetchGoogleBookDetail(apiId);
}

export const fetchBookDetail = cache(fetchBookDetailUncached);

export { isBookNotFoundError };
