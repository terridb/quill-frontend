import type { RelatedBook } from "@/src/types/book";
import { googleBooksFetch } from "@/src/lib/books/google-books/client";
import {
  categoryToSubjectQuery,
} from "@/src/lib/books/google-books/normalize-categories";
import { mapVolumeToRelatedBook } from "@/src/lib/books/google-books/map-volume";
import { googleBooksSearchResponseSchema } from "@/src/lib/books/google-books/schemas";

const FETCH_LIMIT = 20;
const MAX_RELATED = 20;

function appendUniqueBooks(
  books: RelatedBook[],
  seenIds: Set<string>,
  nextBooks: RelatedBook[],
): void {
  for (const book of nextBooks) {
    if (seenIds.has(book.bookId)) {
      continue;
    }
    seenIds.add(book.bookId);
    books.push(book);
    if (books.length >= MAX_RELATED) {
      break;
    }
  }
}

async function fetchBooksBySubject(subject: string): Promise<RelatedBook[]> {
  try {
    const params = new URLSearchParams({
      q: `subject:${categoryToSubjectQuery(subject)}`,
      maxResults: String(FETCH_LIMIT),
      printType: "books",
    });

    const response = await googleBooksFetch(`/volumes?${params.toString()}`, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return [];
    }

    const json: unknown = await response.json();
    const parsed = googleBooksSearchResponseSchema.safeParse(json);

    if (!parsed.success || !parsed.data.items?.length) {
      return [];
    }

    const seenIds = new Set<string>();
    const books: RelatedBook[] = [];

    for (const volume of parsed.data.items) {
      if (seenIds.has(volume.id)) {
        continue;
      }
      seenIds.add(volume.id);
      books.push(mapVolumeToRelatedBook(volume));
    }

    return books;
  } catch {
    return [];
  }
}

export async function fetchRelatedGoogleBooks(
  genreLabels: string[],
  excludeBookId: string,
): Promise<RelatedBook[]> {
  const seenIds = new Set<string>([excludeBookId]);
  const books: RelatedBook[] = [];

  for (const label of genreLabels) {
    if (books.length >= MAX_RELATED) {
      break;
    }

    const genreBooks = await fetchBooksBySubject(label);
    appendUniqueBooks(books, seenIds, genreBooks);
  }

  return books;
}
