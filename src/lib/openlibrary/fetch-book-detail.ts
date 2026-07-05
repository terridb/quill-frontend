import { cache } from "react";
import { extractOpenLibraryId } from "@/src/lib/openlibrary/book-path";
import { getCoverUrl } from "@/src/lib/openlibrary/cover-url";
import { fetchRelatedBooks } from "@/src/lib/openlibrary/fetch-related-books";
import { normalizeDescription } from "@/src/lib/openlibrary/normalize-description";
import { normalizeSubjects } from "@/src/lib/openlibrary/normalize-subjects";
import { pickPageCount } from "@/src/lib/openlibrary/pick-page-count";
import {
  openLibraryAuthorSchema,
  openLibraryEditionsResponseSchema,
  openLibraryWorkSchema,
} from "@/src/lib/openlibrary/schemas";
import type { BookDetail } from "@/src/types/open-library";

const OPEN_LIBRARY_BASE = "https://openlibrary.org";

class BookNotFoundError extends Error {
  constructor(openLibraryId: string) {
    super(`Book not found: ${openLibraryId}`);
    this.name = "BookNotFoundError";
  }
}

async function fetchAuthorNames(authorKeys: string[]): Promise<string> {
  if (authorKeys.length === 0) {
    return "Unknown author";
  }

  const names = await Promise.all(
    authorKeys.map(async (key) => {
      const id = extractOpenLibraryId(key);
      try {
        const response = await fetch(`${OPEN_LIBRARY_BASE}/authors/${id}.json`, {
          headers: { Accept: "application/json" },
          next: { revalidate: 86400 },
        });

        if (!response.ok) {
          return null;
        }

        const json: unknown = await response.json();
        const parsed = openLibraryAuthorSchema.safeParse(json);
        return parsed.success ? (parsed.data.name ?? null) : null;
      } catch {
        return null;
      }
    }),
  );

  const filtered = names.filter((name): name is string => Boolean(name));
  return filtered.length > 0 ? filtered.join(", ") : "Unknown author";
}

async function fetchBookDetailUncached(openLibraryId: string): Promise<BookDetail> {
  const workUrl = `${OPEN_LIBRARY_BASE}/works/${openLibraryId}.json`;
  const editionsUrl = `${OPEN_LIBRARY_BASE}/works/${openLibraryId}/editions.json?limit=20`;

  let workResponse: Response;
  let editionsResponse: Response;

  try {
    [workResponse, editionsResponse] = await Promise.all([
      fetch(workUrl, {
        headers: { Accept: "application/json" },
        next: { revalidate: 86400 },
      }),
      fetch(editionsUrl, {
        headers: { Accept: "application/json" },
        next: { revalidate: 86400 },
      }),
    ]);
  } catch {
    throw new Error("Unable to reach Open Library");
  }

  if (workResponse.status === 404) {
    throw new BookNotFoundError(openLibraryId);
  }

  if (!workResponse.ok) {
    throw new Error(`Open Library request failed with status ${workResponse.status}`);
  }

  const workJson: unknown = await workResponse.json();
  const workParsed = openLibraryWorkSchema.safeParse(workJson);

  if (!workParsed.success) {
    throw new Error("Invalid work response from Open Library");
  }

  const work = workParsed.data;
  const authorKeys =
    work.authors?.map((entry) => entry.author.key) ?? [];

  const [authors, editionsData, relatedBooks] = await Promise.all([
    fetchAuthorNames(authorKeys),
    editionsResponse.ok
      ? editionsResponse.json().then((json: unknown) => {
          const parsed = openLibraryEditionsResponseSchema.safeParse(json);
          return parsed.success ? parsed.data.entries ?? [] : [];
        })
      : Promise.resolve([]),
    (async () => {
      const { primarySubjectSlug } = normalizeSubjects(work.subjects);
      return fetchRelatedBooks(primarySubjectSlug, openLibraryId);
    })(),
  ]);

  const { genreLabels, subjectTags } = normalizeSubjects(work.subjects);
  const coverId = work.covers?.find((id) => id > 0);

  return {
    openLibraryId,
    title: work.title ?? "Untitled",
    authors,
    description: normalizeDescription(work.description),
    genreLabels,
    subjectTags,
    coverUrl: getCoverUrl(coverId),
    numberOfPages: pickPageCount(editionsData),
    relatedBooks,
  };
}

export const fetchBookDetail = cache(fetchBookDetailUncached);

export function isBookNotFoundError(error: unknown): error is BookNotFoundError {
  return error instanceof BookNotFoundError;
}
