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
  apiId: string;
  currentPage: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  addedAt: string;
}

export interface CurrentlyReadingBook extends RelatedBook {
  entryId: string;
  addedAt: string;
}
