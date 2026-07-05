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

export function normalizeSubjects(subjects: string[] | undefined): {
  genreLabels: string[];
  subjectTags: string[];
  primarySubjectSlug: string | null;
} {
  if (!subjects?.length) {
    return { genreLabels: [], subjectTags: [], primarySubjectSlug: null };
  }

  const seen = new Set<string>();
  const labels: string[] = [];

  for (const raw of subjects) {
    const label = cleanSubject(raw);
    if (!label) {
      continue;
    }
    const key = label.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    labels.push(label);
  }

  const genreLabels = labels.slice(0, 4);
  const subjectTags = labels.slice(0, 12);
  const primarySubjectSlug =
    labels.length > 0 ? subjectToSlug(labels[0]!) : null;

  return { genreLabels, subjectTags, primarySubjectSlug };
}
