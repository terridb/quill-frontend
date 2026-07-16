export interface BookSearchResult {
  bookId: string;
  title: string;
  authors: string;
  coverUrl: string | null;
  language: string | null;
}

export interface BookSearchResponse {
  results: BookSearchResult[];
}

export type ReadingStatus =
  | "want_to_read"
  | "currently_reading"
  | "finished"
  | "did_not_finish";

export interface RelatedBook {
  bookId: string;
  title: string;
  authors: string;
  coverUrl: string | null;
}

export interface BookDetail {
  bookId: string;
  title: string;
  authors: string;
  description: string | null;
  genreLabels: string[];
  subjectTags: string[];
  coverUrl: string | null;
  numberOfPages: number | null;
  language: string | null;
  relatedBooks: RelatedBook[];
  authorBooks: RelatedBook[];
}

export const READING_STATUS_LABELS: Record<ReadingStatus, string> = {
  want_to_read: "Want to Read",
  currently_reading: "Currently Reading",
  finished: "Finished",
  did_not_finish: "Did not Finish",
};
