import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

export function normalizeAuthorName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Build author search queries from specific name forms to broader variants. */
export function buildAuthorSearchQueries(author: string): string[] {
  const trimmed = author.trim();
  const queries: string[] = [];
  const seen = new Set<string>();

  function add(query: string): void {
    if (seen.has(query)) {
      return;
    }
    seen.add(query);
    queries.push(query);
  }

  add(`inauthor:"${trimmed}"`);

  const withoutPeriods = trimmed.replace(/(\b[A-Za-z])\.\s*/g, "$1 ").replace(/\s+/g, " ").trim();
  if (withoutPeriods !== trimmed) {
    add(`inauthor:"${withoutPeriods}"`);
  }

  const withoutInitials = trimmed
    .split(/\s+/)
    .filter((part) => !/^[A-Za-z]\.?$/.test(part))
    .join(" ")
    .trim();

  if (withoutInitials && withoutInitials !== trimmed) {
    add(`inauthor:"${withoutInitials}"`);
  }

  return queries.slice(0, 3);
}

/** Broadest negated inauthor clause for related-book search. */
export function buildAuthorExclusionQuery(author: string): string | null {
  const queries = buildAuthorSearchQueries(author);
  const broadest = queries.at(-1);

  if (!broadest) {
    return null;
  }

  return broadest.replace(/^inauthor:/, "-inauthor:");
}

export function appendAuthorExclusionToQuery(query: string, author: string): string {
  const exclusion = buildAuthorExclusionQuery(author);
  if (!exclusion) {
    return query;
  }

  return `${query}+${exclusion}`;
}

export function volumeIncludesAuthor(
  volume: GoogleBooksVolume,
  author: string,
): boolean {
  const authors = volume.volumeInfo.authors;
  if (!authors?.length) {
    return false;
  }

  const target = normalizeAuthorName(author);
  const significantParts = target.split(" ").filter((part) => part.length > 2);
  const lastName = significantParts[significantParts.length - 1] ?? "";

  return authors.some((name) => {
    const candidate = normalizeAuthorName(name);

    if (candidate === target) {
      return true;
    }

    if (candidate.includes(target) || target.includes(candidate)) {
      return true;
    }

    if (!lastName || !candidate.includes(lastName)) {
      return false;
    }

    return significantParts
      .filter((part) => part !== lastName)
      .some((part) => candidate.includes(part));
  });
}

export function relatedBookIncludesAuthor(
  bookAuthors: string,
  author: string,
): boolean {
  const authors = bookAuthors
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  if (authors.length === 0) {
    return false;
  }

  return volumeIncludesAuthor(
    { id: "related", volumeInfo: { authors } },
    author,
  );
}
