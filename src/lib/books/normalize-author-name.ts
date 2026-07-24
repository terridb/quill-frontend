/**
 * Shared author-name normalization for catalog matching, identity keys,
 * and Google Books author filters.
 */

/** Lowercase, treat punctuation as spaces, collapse whitespace. */
export function normalizeAuthorName(name: string): string {
  return name
    .toLowerCase()
    // "J.K." / "J. K." / "J K" → the same token sequence.
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Letters/digits only — so "J.K. Rowling", "J. K. Rowling", and "JK Rowling"
 * all become "jkrowling".
 */
export function compactAuthorName(name: string): string {
  return normalizeAuthorName(name).replace(/[^a-z0-9]/g, "");
}

/** True when two author strings refer to the same person under common variants. */
export function authorNamesMatch(a: string, b: string): boolean {
  const left = normalizeAuthorName(a);
  const right = normalizeAuthorName(b);

  if (!left || !right) {
    return false;
  }

  if (left === right) {
    return true;
  }

  // "J.K. Rowling" / "J. K. Rowling" / "JK Rowling" → same compact key.
  if (compactAuthorName(left) === compactAuthorName(right)) {
    return true;
  }

  const leftTokens = left.split(" ");
  const rightTokens = right.split(" ");
  const leftLast = leftTokens.at(-1);
  const rightLast = rightTokens.at(-1);

  if (!leftLast || leftLast !== rightLast) {
    return false;
  }

  // Ignore single-letter initials when comparing given names so
  // "Sarah Maas" still matches "Sarah J. Maas".
  const leftGiven = leftTokens.slice(0, -1).filter((token) => token.length > 1);
  const rightGiven = rightTokens.slice(0, -1).filter((token) => token.length > 1);

  if (leftGiven.length === 0 || rightGiven.length === 0) {
    return false;
  }

  return leftGiven.some((part) => rightGiven.includes(part));
}
