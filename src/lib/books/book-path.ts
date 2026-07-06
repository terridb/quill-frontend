export function slugifyBookTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Separates volume ID from optional title slug in `/book/[slug]` routes. */
export const BOOK_ROUTE_SEPARATOR = "--";

/** Legacy pattern when IDs were assumed to be alphanumeric only. */
const LEGACY_BOOK_ID_PATTERN = /^([A-Za-z0-9]+)(?:-(.+))?$/;

function decodeBookIdSegment(segment: string): string | null {
  try {
    const bookId = decodeURIComponent(segment);
    return bookId.length > 0 ? bookId : null;
  } catch {
    return null;
  }
}

export function parseBookRouteSlug(slug: string): {
  bookId: string;
  titleSlug?: string;
} | null {
  const separatorIndex = slug.indexOf(BOOK_ROUTE_SEPARATOR);

  if (separatorIndex !== -1) {
    const bookId = decodeBookIdSegment(slug.slice(0, separatorIndex));
    if (!bookId) {
      return null;
    }

    const titleSlug = slug.slice(separatorIndex + BOOK_ROUTE_SEPARATOR.length);
    return {
      bookId,
      titleSlug: titleSlug.length > 0 ? titleSlug : undefined,
    };
  }

  const legacyMatch = slug.match(LEGACY_BOOK_ID_PATTERN);
  if (legacyMatch) {
    return {
      bookId: legacyMatch[1]!,
      titleSlug: legacyMatch[2],
    };
  }

  const bookId = decodeBookIdSegment(slug);
  return bookId ? { bookId } : null;
}

export function getBookPath(bookId: string, title: string): string {
  const encodedId = encodeURIComponent(bookId);
  const titleSlug = slugifyBookTitle(title);

  return titleSlug
    ? `/book/${encodedId}${BOOK_ROUTE_SEPARATOR}${titleSlug}`
    : `/book/${encodedId}`;
}
