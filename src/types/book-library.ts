import type { ReadingStatus } from "@/src/types/book";
import type { List } from "@/src/types/list";

export interface BookLibraryState {
  readingStatus: ReadingStatus | null;
  customListIds: string[];
  defaultLists: List[];
  customLists: List[];
}

export interface UpdateBookLibraryInput {
  readingStatus: ReadingStatus | null;
  customListIds: string[];
  removeFromLibrary?: boolean;
}
