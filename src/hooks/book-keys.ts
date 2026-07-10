export const bookKeys = {
  all: ["books"] as const,
  search: (query: string) => [...bookKeys.all, "search", query] as const,
  detail: (bookId: string) =>
    [...bookKeys.all, "detail", bookId] as const,
  status: (bookId: string) =>
    [...bookKeys.all, "status", bookId] as const,
  library: (bookId: string) =>
    [...bookKeys.all, "library", bookId] as const,
};
