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

export function getBookPath(openLibraryId: string, title: string): string {
  const slug = slugifyBookTitle(title);
  return slug
    ? `/book/${openLibraryId}-${slug}`
    : `/book/${openLibraryId}`;
}
