import {
  areCandidateGenresCompatible,
  GENRE_MATCH_SCORE,
  getMinRelatedScore,
  type RelatedBookSignals,
} from "@/src/lib/books/google-books/score-related-books";

const SUBJECT_MATCH_SCORE = 3;
const MULTI_MATCH_BONUS = 1;

export interface RelatedBookRowCandidate {
  api_id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  language: string | null;
  genres: string[] | null;
  tags: string[] | null;
  shelf_count: number;
}

export interface RankRelatedBookRowsOptions {
  maxResults?: number;
  minScore?: number;
  language?: string | null;
}

function primaryLanguage(code: string | null | undefined): string | null {
  if (!code) {
    return null;
  }

  const primary = code.trim().toLowerCase().split("-")[0];
  return primary || null;
}

export function scoreRelatedBookRow(
  row: RelatedBookRowCandidate,
  source: RelatedBookSignals,
): number {
  const sourceGenres = new Set(
    source.genreLabels.map((label) => label.toLowerCase()),
  );
  const sourceSubjects = new Set(
    source.subjectTags.map((label) => label.toLowerCase()),
  );

  let score = 0;
  let matchCount = 0;

  for (const genre of row.genres ?? []) {
    if (sourceGenres.has(genre.toLowerCase())) {
      score += GENRE_MATCH_SCORE;
      matchCount++;
    }
  }

  for (const tag of row.tags ?? []) {
    if (sourceSubjects.has(tag.toLowerCase())) {
      score += SUBJECT_MATCH_SCORE;
      matchCount++;
    }
  }

  if (matchCount > 1) {
    score += MULTI_MATCH_BONUS;
  }

  return score;
}

export function rankRelatedBookRows(
  rows: RelatedBookRowCandidate[],
  source: RelatedBookSignals,
  options: RankRelatedBookRowsOptions = {},
): RelatedBookRowCandidate[] {
  const {
    maxResults = 20,
    minScore = getMinRelatedScore(source.genreLabels),
    language = null,
  } = options;
  const preferredLanguage = primaryLanguage(language);
  const compatibleRows = rows.filter((row) =>
    areCandidateGenresCompatible(row.genres ?? [], source.genreLabels),
  );
  const maxShelfCount = compatibleRows.reduce(
    (max, row) => Math.max(max, row.shelf_count),
    0,
  );

  return compatibleRows
    .map((row) => {
      const relevanceScore = scoreRelatedBookRow(row, source);
      const popularityScore =
        maxShelfCount === 0
          ? 0
          : Math.log(row.shelf_count + 1) / Math.log(maxShelfCount + 1);
      const languageBonus =
        preferredLanguage &&
        primaryLanguage(row.language) === preferredLanguage
          ? 0.15
          : 0;

      return {
        row,
        relevanceScore,
        sortScore: relevanceScore + popularityScore + languageBonus,
      };
    })
    .filter(({ relevanceScore }) => relevanceScore >= minScore)
    .toSorted((a, b) => {
      if (b.sortScore !== a.sortScore) {
        return b.sortScore - a.sortScore;
      }

      if (b.row.shelf_count !== a.row.shelf_count) {
        return b.row.shelf_count - a.row.shelf_count;
      }

      return a.row.title.localeCompare(b.row.title);
    })
    .slice(0, maxResults)
    .map(({ row }) => row);
}
