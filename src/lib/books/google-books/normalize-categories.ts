import type { BookKind } from "@/src/lib/books/google-books/book-kind";

const NOISE_PATTERNS = [
  /^juvenile (fiction|literature|audience|works)$/i,
  /^fiction$/i,
  /^nonfiction$/i,
  /^general$/i,
  /^literary criticism$/i,
  /^study (guides|and teaching)/i,
  /^history and criticism$/i,
];

const GENRE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /science\s*fiction|sci[\-\s]?fi\b/i, label: "Science Fiction" },
  { pattern: /historical\s*fiction/i, label: "Historical Fiction" },
  { pattern: /fantasy/i, label: "Fantasy" },
  { pattern: /mystery|detective\s+(and\s+mystery|stories|fiction)/i, label: "Mystery" },
  { pattern: /\bromance\b/i, label: "Romance" },
  { pattern: /\bhorror\b/i, label: "Horror" },
  { pattern: /\bthriller\b/i, label: "Thriller" },
  { pattern: /\badventure\b/i, label: "Adventure" },
  { pattern: /autobiograph/i, label: "Autobiography" },
  { pattern: /biograph/i, label: "Biography" },
  { pattern: /\bpoetry\b|\bpoems\b/i, label: "Poetry" },
  { pattern: /young\s+adult/i, label: "Young Adult" },
  { pattern: /graphic\s*novel/i, label: "Graphic Novel" },
  { pattern: /\bmemoir\b/i, label: "Memoir" },
  { pattern: /true\s*crime/i, label: "True Crime" },
];

const MAX_GENRES = 4;
const MAX_SUBJECT_TAGS = 12;
const MAX_LABEL_LENGTH = 32;

function titleCase(label: string): string {
  return label
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 3 && word === word.toLowerCase()) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function extractGenreLabel(raw: string): string | null {
  const trimmed = raw.trim();
  for (const { pattern, label } of GENRE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return label;
    }
  }
  return null;
}

function cleanSubject(raw: string): string | null {
  let label = raw.trim();

  if (!label || label.length > 80) {
    return null;
  }

  if (NOISE_PATTERNS.some((pattern) => pattern.test(label))) {
    return null;
  }

  label = label.split("(")[0]?.trim() ?? label;

  if (!label || label.length > MAX_LABEL_LENGTH) {
    return null;
  }

  if (/^\d/.test(label) || /^[a-z]{2,3}$/i.test(label)) {
    return null;
  }

  return titleCase(label);
}

/** Google Books uses " / " in category paths; normalize to a search subject slug. */
export function categoryToSubjectQuery(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/\s*\/\s*/g, " ")
    .replace(/\s+/g, "+");
}

function flattenCategories(categories: string[]): string[] {
  const subjects: string[] = [];

  for (const category of categories) {
    const parts = category.split(/\s*\/\s*/);
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed) {
        subjects.push(trimmed);
      }
    }
  }

  return subjects;
}

function extractGenreLabels(subjects: string[]): string[] {
  const seen = new Set<string>();
  const genres: string[] = [];

  for (const raw of subjects) {
    const genre = extractGenreLabel(raw);
    if (!genre) {
      continue;
    }
    const key = genre.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    genres.push(genre);
    if (genres.length >= MAX_GENRES) {
      break;
    }
  }

  return genres;
}

function extractSubjectTags(subjects: string[], genreLabels: string[]): string[] {
  const genreKeys = new Set(genreLabels.map((label) => label.toLowerCase()));
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const raw of subjects) {
    if (extractGenreLabel(raw)) {
      continue;
    }

    const label = cleanSubject(raw);
    if (!label) {
      continue;
    }

    const key = label.toLowerCase();
    if (seen.has(key) || genreKeys.has(key)) {
      continue;
    }

    seen.add(key);
    tags.push(label);
    if (tags.length >= MAX_SUBJECT_TAGS) {
      break;
    }
  }

  return tags;
}

export function normalizeCategories(
  categories: string[] | undefined,
  mainCategory?: string,
): {
  genreLabels: string[];
  subjectTags: string[];
} {
  const categoryPaths = [...(categories ?? [])];
  const trimmedMainCategory = mainCategory?.trim();

  if (
    trimmedMainCategory &&
    !categoryPaths.some((category) => category.trim() === trimmedMainCategory)
  ) {
    categoryPaths.unshift(trimmedMainCategory);
  }

  if (categoryPaths.length === 0) {
    return { genreLabels: [], subjectTags: [] };
  }

  const subjects = flattenCategories(categoryPaths);
  const genreLabels = extractGenreLabels(subjects);
  const subjectTags = extractSubjectTags(subjects, genreLabels);

  return { genreLabels, subjectTags };
}

const MAX_SEARCH_QUERIES = 5;

const GENRE_SEARCH_ORDER = [
  "Fantasy",
  "Romance",
  "Science Fiction",
  "Young Adult",
  "Mystery",
  "Thriller",
  "Horror",
];

function orderGenresForSearch(genreLabels: string[]): string[] {
  return [...genreLabels].sort((left, right) => {
    const leftIndex = GENRE_SEARCH_ORDER.indexOf(left);
    const rightIndex = GENRE_SEARCH_ORDER.indexOf(right);
    const normalizedLeft = leftIndex === -1 ? GENRE_SEARCH_ORDER.length : leftIndex;
    const normalizedRight = rightIndex === -1 ? GENRE_SEARCH_ORDER.length : rightIndex;

    if (normalizedLeft !== normalizedRight) {
      return normalizedLeft - normalizedRight;
    }

    return left.localeCompare(right);
  });
}

/** Too broad for standalone subject: queries; still used in overlap scoring. */
const GENERIC_SEARCH_SUBJECTS = new Set([
  "love",
  "women",
  "men",
  "marriage",
  "family",
  "sex",
  "gender",
  "relationships",
  "society",
  "life",
  "death",
  "war",
  "world",
]);

/** Vague subject tags that should only appear paired with a genre, never alone. */
const WEAK_SUBJECT_TAGS = new Set(["epic", "paranormal", "general", "magic", "adventure"]);

function isSearchableSubject(label: string): boolean {
  return !GENERIC_SEARCH_SUBJECTS.has(label.toLowerCase());
}

function isStrongSubject(label: string): boolean {
  return isSearchableSubject(label) && !WEAK_SUBJECT_TAGS.has(label.toLowerCase());
}

function subjectClause(label: string): string {
  return `subject:${categoryToSubjectQuery(label)}`;
}

export interface BuildRelatedBookSearchQueriesOptions {
  bookKind?: BookKind;
}

/** Build Google Books search queries from specific to broad for related-book discovery. */
export function buildRelatedBookSearchQueries(
  genreLabels: string[],
  subjectTags: string[],
  options: BuildRelatedBookSearchQueriesOptions = {},
): string[] {
  const { bookKind = "unknown" } = options;
  const queries: string[] = [];
  const seen = new Set<string>();

  function buildQuery(clauses: string[]): string {
    return clauses.join("+");
  }

  function addQuery(clauses: string[]): void {
    const query = buildQuery(clauses);
    if (seen.has(query)) {
      return;
    }
    seen.add(query);
    queries.push(query);
  }

  const orderedGenres = orderGenresForSearch(genreLabels);
  const topSubjects = subjectTags
    .filter(isSearchableSubject)
    .slice(0, 3);
  const strongSubjects = topSubjects.filter(isStrongSubject);
  const hasSubjectQueries = strongSubjects.length > 0;
  const primaryGenre = orderedGenres[0];
  const secondaryGenre = orderedGenres[1];

  if (primaryGenre && secondaryGenre) {
    addQuery([subjectClause(primaryGenre), subjectClause(secondaryGenre)]);
  }

  if (primaryGenre && orderedGenres.includes("Fantasy") && orderedGenres.includes("Romance")) {
    addQuery([subjectClause("Fantasy"), subjectClause("Young Adult")]);
  }

  for (let i = 0; i < strongSubjects.length; i++) {
    for (let j = i + 1; j < strongSubjects.length; j++) {
      addQuery([subjectClause(strongSubjects[i]), subjectClause(strongSubjects[j])]);
    }
  }

  if (primaryGenre) {
    for (const tag of topSubjects.slice(0, 3)) {
      addQuery([subjectClause(primaryGenre), subjectClause(tag)]);
    }
    if (secondaryGenre) {
      for (const tag of topSubjects.slice(0, 2)) {
        addQuery([subjectClause(secondaryGenre), subjectClause(tag)]);
      }
    }
  }

  for (const tag of strongSubjects) {
    addQuery([subjectClause(tag)]);
  }

  if (!hasSubjectQueries) {
    for (const genre of orderedGenres) {
      addQuery([subjectClause(genre)]);
    }
    return queries.slice(0, MAX_SEARCH_QUERIES);
  }

  const broadFallbackQuery =
    primaryGenre && secondaryGenre
      ? buildQuery([subjectClause(primaryGenre), subjectClause(secondaryGenre)])
      : primaryGenre
        ? buildQuery([subjectClause(primaryGenre)])
        : null;
  const specificQueries = queries.filter((query) => query !== broadFallbackQuery);
  const trimmedSpecific = specificQueries.slice(0, MAX_SEARCH_QUERIES - 1);

  if (broadFallbackQuery) {
    return [...trimmedSpecific, broadFallbackQuery];
  }

  return trimmedSpecific.slice(0, MAX_SEARCH_QUERIES);
}
