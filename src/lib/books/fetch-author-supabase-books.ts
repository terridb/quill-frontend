import type { SupabaseClient } from "@supabase/supabase-js";
import type { RelatedBook } from "@/src/types/book";
import type { Database } from "@/src/types/database";
import { bookIdentityKey } from "@/src/lib/ai/book-identity";
import {
  normalizeAuthorName,
  relatedBookIncludesAuthor,
} from "@/src/lib/books/google-books/author-matching";

type TypedSupabaseClient = SupabaseClient<Database>;

const AUTHOR_SELECT =
  "api_id, title, author, cover_url, language, shelf_count" as const;
const CANDIDATE_FETCH_LIMIT = 60;
const MAX_AUTHOR_BOOKS = 20;

export interface FetchAuthorSupabaseBooksOptions {
  supabase: TypedSupabaseClient;
  author: string;
  excludeApiId: string;
  language: string | null;
  maxResults?: number;
}

interface AuthorBookRow {
  api_id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  language: string | null;
  shelf_count: number;
}

function primaryLanguage(code: string | null | undefined): string | null {
  if (!code) {
    return null;
  }

  const primary = code.trim().toLowerCase().split("-")[0];
  return primary || null;
}

/** Broad ilike token so "J. K. Rowling" and "Ali Hazelwood" both hit catalog rows. */
export function authorSearchToken(author: string): string | null {
  const normalized = normalizeAuthorName(author);
  const parts = normalized.split(" ").filter((part) => part.length > 1);

  if (parts.length === 0) {
    return null;
  }

  return parts[parts.length - 1] ?? null;
}

function mapRowToRelatedBook(row: AuthorBookRow): RelatedBook {
  return {
    bookId: row.api_id,
    title: row.title,
    authors: row.author ?? "Unknown author",
    coverUrl: row.cover_url,
  };
}

/** Keep one edition per title+author, preferring higher shelf_count. */
function dedupeAuthorRows(rows: AuthorBookRow[]): AuthorBookRow[] {
  const bestByKey = new Map<string, AuthorBookRow>();

  for (const row of rows) {
    const key = bookIdentityKey(row.author ?? "", row.title);
    const existing = bestByKey.get(key);

    if (!existing || row.shelf_count > existing.shelf_count) {
      bestByKey.set(key, row);
    }
  }

  return [...bestByKey.values()];
}

function rankAuthorRows(
  rows: AuthorBookRow[],
  language: string | null,
  maxResults: number,
): AuthorBookRow[] {
  const preferredLanguage = primaryLanguage(language);
  const uniqueRows = dedupeAuthorRows(rows);
  const maxShelfCount = uniqueRows.reduce(
    (max, row) => Math.max(max, row.shelf_count),
    0,
  );

  return uniqueRows
    .map((row) => {
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
        sortScore: popularityScore + languageBonus,
      };
    })
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

export async function fetchAuthorSupabaseBooks({
  supabase,
  author,
  excludeApiId,
  language,
  maxResults = MAX_AUTHOR_BOOKS,
}: FetchAuthorSupabaseBooksOptions): Promise<RelatedBook[]> {
  const token = authorSearchToken(author);

  if (!token) {
    return [];
  }

  const { data, error } = await supabase
    .from("books")
    .select(AUTHOR_SELECT)
    .ilike("author", `%${token}%`)
    .neq("api_id", excludeApiId)
    .not("cover_url", "is", null)
    .limit(CANDIDATE_FETCH_LIMIT);

  if (error || !data) {
    return [];
  }

  const matches = data.filter((row) =>
    relatedBookIncludesAuthor(row.author ?? "", author),
  );

  return rankAuthorRows(matches, language, maxResults).map(mapRowToRelatedBook);
}

export { MAX_AUTHOR_BOOKS as MAX_AUTHOR_SUPABASE_BOOKS };
