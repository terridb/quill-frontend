/** Normalize for matching the same work across Google Books editions. */
export function normalizeBookTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeAuthorName(authors: string): string {
  return authors.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Stable key so different volume ids of the same title+author can be excluded together. */
export function bookIdentityKey(authors: string, title: string): string {
  return `${normalizeAuthorName(authors)}|${normalizeBookTitle(title)}`;
}
