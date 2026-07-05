import { extractOpenLibraryId } from "@/src/lib/openlibrary/book-path";
import { getCoverUrl } from "@/src/lib/openlibrary/cover-url";
import { subjectToSlug } from "@/src/lib/openlibrary/normalize-subjects";
import { openLibrarySubjectsResponseSchema } from "@/src/lib/openlibrary/schemas";
import type { RelatedBook } from "@/src/types/open-library";

const OPEN_LIBRARY_BASE = "https://openlibrary.org";
const FETCH_LIMIT = 20;
const MAX_RELATED = 20;

function appendUniqueBooks(
  books: RelatedBook[],
  seenIds: Set<string>,
  nextBooks: RelatedBook[],
): void {
  for (const book of nextBooks) {
    if (seenIds.has(book.openLibraryId)) {
      continue;
    }
    seenIds.add(book.openLibraryId);
    books.push(book);
    if (books.length >= MAX_RELATED) {
      break;
    }
  }
}

async function fetchBooksByGenreSlug(genreSlug: string): Promise<RelatedBook[]> {
  try {
    const url = `${OPEN_LIBRARY_BASE}/subjects/${encodeURIComponent(genreSlug)}.json?limit=${FETCH_LIMIT}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return [];
    }

    const json: unknown = await response.json();
    const parsed = openLibrarySubjectsResponseSchema.safeParse(json);

    if (!parsed.success || !parsed.data.works?.length) {
      return [];
    }

    const seenIds = new Set<string>();
    const books: RelatedBook[] = [];

    for (const work of parsed.data.works) {
      const openLibraryId = extractOpenLibraryId(work.key);
      if (seenIds.has(openLibraryId)) {
        continue;
      }
      seenIds.add(openLibraryId);

      const authors =
        work.authors
          ?.map((author) => author.name)
          .filter((name): name is string => Boolean(name))
          .join(", ") ?? "Unknown author";

      books.push({
        openLibraryId,
        title: work.title ?? "Untitled",
        authors,
        coverUrl: getCoverUrl(work.cover_id),
      });
    }

    return books;
  } catch {
    return [];
  }
}

export async function fetchRelatedBooks(
  genreLabels: string[],
  excludeOpenLibraryId: string,
): Promise<RelatedBook[]> {
  const seenIds = new Set<string>([excludeOpenLibraryId]);
  const books: RelatedBook[] = [];

  for (const label of genreLabels) {
    if (books.length >= MAX_RELATED) {
      break;
    }

    const genreBooks = await fetchBooksByGenreSlug(subjectToSlug(label));
    appendUniqueBooks(books, seenIds, genreBooks);
  }

  return books;
}
