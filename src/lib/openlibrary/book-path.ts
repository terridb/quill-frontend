export function extractOpenLibraryId(key: string): string {
  const segments = key.split("/");
  return segments[segments.length - 1] ?? key;
}

export function slugifyBookTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Matches Open Library work/edition IDs (e.g. OL45804W). */
const OPEN_LIBRARY_ID_PATTERN = /^(OL\d+[A-Z])(?:-(.+))?$/;

export function parseBookRouteSlug(slug: string): {
  openLibraryId: string;
  titleSlug?: string;
} | null {
  const match = slug.match(OPEN_LIBRARY_ID_PATTERN);
  if (!match) {
    return null;
  }

  return {
    openLibraryId: match[1],
    titleSlug: match[2],
  };
}

export function getBookPath(openLibraryId: string, title: string): string {
  const slug = slugifyBookTitle(title);
  return slug
    ? `/book/${openLibraryId}-${slug}`
    : `/book/${openLibraryId}`;
}
