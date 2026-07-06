export function slugifyBookTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Google Books volume IDs are alphanumeric (no hyphens or underscores). */
const BOOK_ID_PATTERN = /^([A-Za-z0-9]+)(?:-(.+))?$/;

export function parseBookRouteSlug(slug: string): {
  bookId: string;
  titleSlug?: string;
} | null {
  const match = slug.match(BOOK_ID_PATTERN);
  if (!match) {
    return null;
  }

  return {
    bookId: match[1]!,
    titleSlug: match[2],
  };
}

export function getBookPath(bookId: string, title: string): string {
  const slug = slugifyBookTitle(title);
  return slug ? `/book/${bookId}-${slug}` : `/book/${bookId}`;
}
