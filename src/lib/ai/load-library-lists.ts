import type { SupabaseClient } from "@supabase/supabase-js";
import {
  bookIdentityKey,
  normalizeAuthorName,
} from "@/src/lib/ai/book-identity";
import { truncateText } from "@/src/lib/ai/truncate";
import { listNameToReadingStatus } from "@/src/lib/lists/reading-status-map";
import type { List } from "@/src/types/list";
import type { Database } from "@/src/types/database";
import type { ReadingStatus } from "@/src/types/book";

type TypedSupabaseClient = SupabaseClient<Database>;

export type AiLibraryBook = {
  apiId: string;
  title: string;
  authors: string;
  description: string | null;
  genres: string[];
  tags: string[];
  language: string | null;
};

export type AiLibraryList = {
  id: string;
  name: string;
  isDefault: boolean;
  isPrivate: boolean;
  readingStatus: ReadingStatus | null;
  /** Positive taste signal for recommendations. */
  useForTaste: boolean;
  /** Never recommend these titles; treat as avoid signal when Did Not Finish. */
  excludeFromRecommendations: boolean;
  books: AiLibraryBook[];
};

type EntryRow = {
  books:
    | {
        api_id: string;
        title: string;
        author: string | null;
        description: string | null;
        genres: string[] | null;
        tags: string[] | null;
        language: string | null;
      }
    | {
        api_id: string;
        title: string;
        author: string | null;
        description: string | null;
        genres: string[] | null;
        tags: string[] | null;
        language: string | null;
      }[]
    | null;
};

function mapBook(row: EntryRow): AiLibraryBook | null {
  const book = Array.isArray(row.books) ? row.books[0] : row.books;
  if (!book) {
    return null;
  }

  return {
    apiId: book.api_id,
    title: book.title,
    authors: book.author ?? "Unknown author",
    description: truncateText(book.description, 280),
    genres: book.genres ?? [],
    tags: book.tags ?? [],
    language: book.language?.trim().toLowerCase().split("-")[0] ?? null,
  };
}

function listFlags(list: List): Pick<
  AiLibraryList,
  "readingStatus" | "useForTaste" | "excludeFromRecommendations"
> {
  const readingStatus = listNameToReadingStatus(list.name);

  if (readingStatus === "did_not_finish") {
    return {
      readingStatus,
      useForTaste: false,
      excludeFromRecommendations: true,
    };
  }

  // Any non-DNF shelf informs taste; anything already shelved is excluded from picks
  // (including other Google Books editions of the same title via book keys).
  return {
    readingStatus,
    useForTaste: true,
    excludeFromRecommendations: true,
  };
}

async function loadBooksForList(
  supabase: TypedSupabaseClient,
  listId: string,
): Promise<AiLibraryBook[]> {
  const { data, error } = await supabase
    .from("list_entries")
    .select(
      `
      books (
        api_id,
        title,
        author,
        description,
        genres,
        tags,
        language
      )
    `,
    )
    .eq("list_id", listId)
    .order("added_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data
    .map((row) => mapBook(row as EntryRow))
    .filter((book): book is AiLibraryBook => book !== null);
}

export async function loadAiLibraryLists(
  supabase: TypedSupabaseClient,
  lists: List[],
): Promise<AiLibraryList[]> {
  return Promise.all(
    lists.map(async (list) => {
      const flags = listFlags(list);
      const books = await loadBooksForList(supabase, list.id);
      return {
        id: list.id,
        name: list.name,
        isDefault: list.isDefault,
        isPrivate: list.isPrivate,
        ...flags,
        books,
      };
    }),
  );
}

export function collectExcludedApiIds(lists: AiLibraryList[]): string[] {
  const ids = new Set<string>();
  for (const list of lists) {
    if (!list.excludeFromRecommendations) {
      continue;
    }
    for (const book of list.books) {
      ids.add(book.apiId);
    }
  }
  return [...ids];
}

/** Title+author keys so other editions of owned books are also filtered from search. */
export function collectExcludedBookKeys(lists: AiLibraryList[]): string[] {
  const keys = new Set<string>();
  for (const list of lists) {
    if (!list.excludeFromRecommendations) {
      continue;
    }
    for (const book of list.books) {
      keys.add(bookIdentityKey(book.authors, book.title));
    }
  }
  return [...keys];
}

/** Authors from taste shelves, most frequent first — primary recommendation search targets. */
export function collectTasteAuthors(lists: AiLibraryList[]): string[] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const list of lists) {
    if (!list.useForTaste) {
      continue;
    }
    for (const book of list.books) {
      const normalized = normalizeAuthorName(book.authors);
      if (!normalized || normalized === "unknown author") {
        continue;
      }
      const existing = counts.get(normalized);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(normalized, { label: book.authors, count: 1 });
      }
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .map((entry) => entry.label);
}

/** Dominant shelf languages (ISO 639-1), most common first. Defaults to English when unknown. */
export function collectPreferredLanguages(lists: AiLibraryList[]): string[] {
  const counts = new Map<string, number>();

  for (const list of lists) {
    if (!list.useForTaste) {
      continue;
    }
    for (const book of list.books) {
      if (!book.language) {
        continue;
      }
      counts.set(book.language, (counts.get(book.language) ?? 0) + 1);
    }
  }

  if (counts.size === 0) {
    return ["en"];
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([code]) => code);
}
