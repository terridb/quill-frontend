import type { SupabaseClient } from "@supabase/supabase-js";
import type { RelatedBook } from "@/src/types/book";
import type { Database } from "@/src/types/database";
import { relatedBookIncludesAuthor } from "@/src/lib/books/google-books/author-matching";
import {
  getMinRelatedScore,
  type RelatedBookSignals,
} from "@/src/lib/books/google-books/score-related-books";
import {
  rankRelatedBookRows,
  type RelatedBookRowCandidate,
} from "@/src/lib/books/score-related-book-rows";

type TypedSupabaseClient = SupabaseClient<Database>;

const RELATED_SELECT =
  "api_id, title, author, cover_url, language, genres, tags, shelf_count" as const;
const CANDIDATE_FETCH_LIMIT = 80;
const MAX_RELATED = 20;

export interface FetchRelatedSupabaseBooksOptions extends RelatedBookSignals {
  supabase: TypedSupabaseClient;
  excludeApiId: string;
  language: string | null;
  excludeAuthor?: string | null;
  maxResults?: number;
}

function mapRowToRelatedBook(row: RelatedBookRowCandidate): RelatedBook {
  return {
    bookId: row.api_id,
    title: row.title,
    authors: row.author ?? "Unknown author",
    coverUrl: row.cover_url,
  };
}

function mergeCandidates(
  groups: Array<RelatedBookRowCandidate[] | null>,
): RelatedBookRowCandidate[] {
  const seenIds = new Set<string>();
  const rows: RelatedBookRowCandidate[] = [];

  for (const group of groups) {
    if (!group) {
      continue;
    }

    for (const row of group) {
      if (seenIds.has(row.api_id) || !row.cover_url) {
        continue;
      }
      seenIds.add(row.api_id);
      rows.push(row);
    }
  }

  return rows;
}

async function fetchByGenreOverlap(
  supabase: TypedSupabaseClient,
  genres: string[],
  excludeApiId: string,
): Promise<RelatedBookRowCandidate[]> {
  if (genres.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("books")
    .select(RELATED_SELECT)
    .overlaps("genres", genres)
    .neq("api_id", excludeApiId)
    .not("cover_url", "is", null)
    .limit(CANDIDATE_FETCH_LIMIT);

  if (error || !data) {
    return [];
  }

  return data;
}

async function fetchByTagOverlap(
  supabase: TypedSupabaseClient,
  tags: string[],
  excludeApiId: string,
): Promise<RelatedBookRowCandidate[]> {
  if (tags.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("books")
    .select(RELATED_SELECT)
    .overlaps("tags", tags)
    .neq("api_id", excludeApiId)
    .not("cover_url", "is", null)
    .limit(CANDIDATE_FETCH_LIMIT);

  if (error || !data) {
    return [];
  }

  return data;
}

export async function fetchRelatedSupabaseBooks({
  supabase,
  genreLabels,
  subjectTags,
  excludeApiId,
  language,
  excludeAuthor = null,
  maxResults = MAX_RELATED,
}: FetchRelatedSupabaseBooksOptions): Promise<RelatedBook[]> {
  if (genreLabels.length === 0 && subjectTags.length === 0) {
    return [];
  }

  const [genreMatches, tagMatches] = await Promise.all([
    fetchByGenreOverlap(supabase, genreLabels, excludeApiId),
    fetchByTagOverlap(supabase, subjectTags, excludeApiId),
  ]);

  const candidates = mergeCandidates([genreMatches, tagMatches]).filter(
    (row) =>
      !excludeAuthor ||
      !relatedBookIncludesAuthor(row.author ?? "", excludeAuthor),
  );

  const ranked = rankRelatedBookRows(
    candidates,
    { genreLabels, subjectTags },
    {
      maxResults,
      minScore: getMinRelatedScore(genreLabels),
      language,
    },
  );

  return ranked.map(mapRowToRelatedBook);
}

export { MAX_RELATED as MAX_RELATED_SUPABASE_BOOKS };
