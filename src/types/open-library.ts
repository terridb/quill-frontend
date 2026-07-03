export interface BookSearchResult {
  id: string;
  title: string;
  authors: string;
  coverUrl: string | null;
}

export interface BookSearchResponse {
  results: BookSearchResult[];
}
