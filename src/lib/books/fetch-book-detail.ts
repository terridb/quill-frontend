import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookDetail, RelatedBook } from "@/src/types/book";
import type { Database } from "@/src/types/database";
import {
  fetchAuthorSupabaseBooks,
  MAX_AUTHOR_SUPABASE_BOOKS,
} from "@/src/lib/books/fetch-author-supabase-books";
import { backfillBookLanguage } from "@/src/lib/books/backfill-book-language";
import {
  fetchRelatedSupabaseBooks,
  MAX_RELATED_SUPABASE_BOOKS,
} from "@/src/lib/books/fetch-related-supabase-books";
import { getBookByApiId } from "@/src/lib/books/get-book-by-api-id";
import { mapBookRowToBookDetail } from "@/src/lib/books/map-book-row-to-detail";
import { mergeRelatedBooks } from "@/src/lib/books/merge-related-books";
import type { BookExclusion } from "@/src/lib/books/google-books/book-exclusion";
import type { BookKind } from "@/src/lib/books/google-books/book-kind";
import {
  fetchGoogleBookDetail,
  isBookNotFoundError,
} from "@/src/lib/books/google-books/fetch-book-detail";
import { fetchAuthorGoogleBooks } from "@/src/lib/books/google-books/fetch-author-books";
import { fetchGoogleVolume } from "@/src/lib/books/google-books/fetch-google-volume";
import { fetchRelatedGoogleBooks } from "@/src/lib/books/google-books/fetch-related-books";
import { getVolumeLanguage } from "@/src/lib/books/google-books/is-recommendable-volume";
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

async function fetchRelatedBooksForCatalogRow(
  supabase: SupabaseClient<Database>,
  options: {
    genreLabels: string[];
    subjectTags: string[];
    exclusion: BookExclusion;
    language: string | null;
    primaryAuthor: string | null;
  },
): Promise<RelatedBook[]> {
  const { genreLabels, subjectTags, exclusion, language, primaryAuthor } =
    options;

  const local = await fetchRelatedSupabaseBooks({
    supabase,
    genreLabels,
    subjectTags,
    excludeApiId: exclusion.bookId,
    language,
    excludeAuthor: primaryAuthor,
    maxResults: MAX_RELATED_SUPABASE_BOOKS,
  });

  if (local.length >= MAX_RELATED_SUPABASE_BOOKS) {
    return local;
  }

  const remote = await fetchRelatedGoogleBooks({
    genreLabels,
    subjectTags,
    exclusion,
    language,
    sourceBookKind: getBookKindFromGenres(genreLabels),
    excludeAuthor: primaryAuthor,
  });

  return mergeRelatedBooks(local, remote, MAX_RELATED_SUPABASE_BOOKS);
}

async function fetchAuthorBooksForCatalogRow(
  supabase: SupabaseClient<Database>,
  author: string,
  exclusion: BookExclusion,
  language: string | null,
): Promise<RelatedBook[]> {
  const local = await fetchAuthorSupabaseBooks({
    supabase,
    author,
    excludeApiId: exclusion.bookId,
    language,
    maxResults: MAX_AUTHOR_SUPABASE_BOOKS,
  });

  if (local.length >= MAX_AUTHOR_SUPABASE_BOOKS) {
    return local;
  }

  const remote = await fetchAuthorGoogleBooks(
    author,
    exclusion,
    language,
    MAX_AUTHOR_SUPABASE_BOOKS,
  );

  return mergeRelatedBooks(local, remote, MAX_AUTHOR_SUPABASE_BOOKS);
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
          await backfillBookLanguage(supabase, book.id, language);
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
      fetchRelatedBooksForCatalogRow(supabase, {
        genreLabels,
        subjectTags,
        exclusion,
        language: book.language,
        primaryAuthor,
      }),
      primaryAuthor
        ? fetchAuthorBooksForCatalogRow(
            supabase,
            primaryAuthor,
            exclusion,
            book.language,
          )
        : Promise.resolve([]),
    ]);

    return mapBookRowToBookDetail(book, relatedBooks, authorBooks);
  }

  return fetchGoogleBookDetail(apiId);
}

export const fetchBookDetail = cache(fetchBookDetailUncached);

export { isBookNotFoundError };
