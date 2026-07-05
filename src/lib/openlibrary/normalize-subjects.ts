const NOISE_PATTERNS = [
  /^series:/i,
  /^reading level/i,
  /^nyt:/i,
  /^open library staff picks$/i,
  /fiction,?\s*(general|historical)/i,
  /^children'?s fiction$/i,
  /^juvenile (fiction|literature|audience|works)$/i,
  /^translations? into /i,
  /^english (fiction|literature|drama)/i,
  /^fiction$/i,
  /^drama$/i,
  /^large type books$/i,
  /^comic books/i,
  /^study (guides|and teaching)/i,
  /^history and criticism$/i,
  /^new york times bestseller$/i,
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

  label = label.replace(/^series:/i, "").trim();
  label = label.split(" -- ")[0]?.split(", fiction")[0]?.trim() ?? label;
  label = label.split("(")[0]?.trim() ?? label;

  if (!label || label.length > MAX_LABEL_LENGTH) {
    return null;
  }

  if (/^\d/.test(label) || /^[a-z]{2,3}$/i.test(label)) {
    return null;
  }

  return titleCase(label);
}

export function subjectToSlug(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
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

export function normalizeSubjects(subjects: string[] | undefined): {
  genreLabels: string[];
  subjectTags: string[];
  primaryGenreSlug: string | null;
} {
  if (!subjects?.length) {
    return { genreLabels: [], subjectTags: [], primaryGenreSlug: null };
  }

  const genreLabels = extractGenreLabels(subjects);
  const subjectTags = extractSubjectTags(subjects, genreLabels);
  const primaryGenreSlug =
    genreLabels.length > 0 ? subjectToSlug(genreLabels[0]!) : null;

  return { genreLabels, subjectTags, primaryGenreSlug };
}
