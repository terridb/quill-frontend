import { extractOpenLibraryId } from "@/src/lib/openlibrary/book-path";
import { getCoverUrl } from "@/src/lib/openlibrary/cover-url";
import { openLibrarySubjectsResponseSchema } from "@/src/lib/openlibrary/schemas";
import type { RelatedBook } from "@/src/types/open-library";

const OPEN_LIBRARY_BASE = "https://openlibrary.org";
const MAX_RELATED = 6;

export async function fetchRelatedBooks(
  subjectSlug: string | null,
  excludeOpenLibraryId: string,
): Promise<RelatedBook[]> {
  if (!subjectSlug) {
    return [];
  }

  try {
    const url = `${OPEN_LIBRARY_BASE}/subjects/${encodeURIComponent(subjectSlug)}.json?limit=8`;
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

    return parsed.data.works
      .map((work) => {
        const openLibraryId = extractOpenLibraryId(work.key);
        const authors =
          work.authors
            ?.map((author) => author.name)
            .filter((name): name is string => Boolean(name))
            .join(", ") ?? "Unknown author";

        return {
          openLibraryId,
          title: work.title ?? "Untitled",
          authors,
          coverUrl: getCoverUrl(work.cover_id),
        };
      })
      .filter((book) => book.openLibraryId !== excludeOpenLibraryId)
      .slice(0, MAX_RELATED);
  } catch {
    return [];
  }
}
