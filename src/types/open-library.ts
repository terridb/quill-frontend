export interface BookSearchResult {
  id: string;
  openLibraryId: string;
  title: string;
  authors: string;
  coverUrl: string | null;
}

export interface BookSearchResponse {
  results: BookSearchResult[];
}
