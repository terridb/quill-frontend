import type { RelatedBook } from "@/src/types/book";

export interface List {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isPrivate: boolean;
  createdAt: string;
}

export interface ListEntry {
  id: string;
  listId: string;
  bookId: string;
  currentPage: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  addedAt: string;
}

export interface ListEntryWithBook extends ListEntry {
  apiId: string;
  title: string;
  authors: string;
  coverUrl: string | null;
}

export interface ListBook extends RelatedBook {
  entryId: string;
  addedAt: string;
}

/** @deprecated Use ListBook */
export type CurrentlyReadingBook = ListBook;

export interface ListWithBooks extends List {
  books: ListBook[];
  entryCount: number;
}

export interface ListsOverview {
  defaultLists: ListWithBooks[];
  customLists: ListWithBooks[];
}

export interface ListDetail {
  list: List;
  books: ListBook[];
  isOwner: boolean;
}
