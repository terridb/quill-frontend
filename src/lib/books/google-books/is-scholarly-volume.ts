import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

const SCHOLARLY_CATEGORY_PATTERNS: RegExp[] = [
  /\bsocial\s+science\b/i,
  /\bwomen'?s\s+studies\b/i,
  /\bgender\s+studies\b/i,
  /\bpsychology\b/i,
  /\bacademic\b/i,
  /\bsociolog/i,
  /\banthropolog/i,
  /\bpolitical\s+science\b/i,
];

const STUDY_GUIDE_PATTERNS: RegExp[] = [
  /\bstudy\s+guide\b/i,
  /\bcliffsnotes\b/i,
  /\bsparknotes\b/i,
  /\bsummary\s+and\s+analysis\b/i,
  /\bbook\s+analysis\b/i,
  /\bfor\s+students\b/i,
];

function flattenCategoryText(volume: GoogleBooksVolume): string[] {
  const parts: string[] = [];

  for (const category of volume.volumeInfo.categories ?? []) {
    for (const segment of category.split(/\s*\/\s*/)) {
      const trimmed = segment.trim();
      if (trimmed) {
        parts.push(trimmed);
      }
    }
  }

  const mainCategory = volume.volumeInfo.mainCategory?.trim();
  if (mainCategory) {
    parts.push(mainCategory);
  }

  return parts;
}

function matchesAnyPattern(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

/** Detect academic monographs and study-guide junk unsuitable for fiction recommendations. */
export function isScholarlyOrStudyGuideVolume(volume: GoogleBooksVolume): boolean {
  const title = volume.volumeInfo.title ?? "";
  if (matchesAnyPattern(title, STUDY_GUIDE_PATTERNS)) {
    return true;
  }

  const parts = flattenCategoryText(volume);
  return parts.some(
    (part) =>
      matchesAnyPattern(part, SCHOLARLY_CATEGORY_PATTERNS) ||
      matchesAnyPattern(part, STUDY_GUIDE_PATTERNS),
  );
}
