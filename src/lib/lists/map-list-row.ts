import type { List, ListEntryWithBook } from "@/src/types/list";

export function mapListRow(data: {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  is_private: boolean;
  created_at: string;
}): List {
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    description: data.description,
    isDefault: data.is_default,
    isPrivate: data.is_private,
    createdAt: data.created_at,
  };
}

type ListEntryRow = {
  id: string;
  list_id: string;
  book_id: string;
  current_page: number | null;
  page_count?: number | null;
  started_at: string | null;
  finished_at: string | null;
  added_at: string;
  books:
    | {
        api_id: string;
        title: string;
        author: string | null;
        cover_url: string | null;
        page_count?: number | null;
      }
    | {
        api_id: string;
        title: string;
        author: string | null;
        cover_url: string | null;
        page_count?: number | null;
      }[]
    | null;
};

export function mapListEntryRow(data: ListEntryRow): ListEntryWithBook | null {
  const book = Array.isArray(data.books) ? data.books[0] : data.books;

  if (!book) {
    return null;
  }

  return {
    id: data.id,
    listId: data.list_id,
    bookId: data.book_id,
    currentPage: data.current_page,
    pageCount: data.page_count ?? book.page_count ?? null,
    startedAt: data.started_at,
    finishedAt: data.finished_at,
    addedAt: data.added_at,
    apiId: book.api_id,
    title: book.title,
    authors: book.author ?? "Unknown author",
    coverUrl: book.cover_url,
  };
}
