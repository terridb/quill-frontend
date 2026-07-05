export const bookKeys = {
  all: ["books"] as const,
  search: (query: string) => [...bookKeys.all, "search", query] as const,
  detail: (openLibraryId: string) =>
    [...bookKeys.all, "detail", openLibraryId] as const,
  status: (openLibraryId: string) =>
    [...bookKeys.all, "status", openLibraryId] as const,
};
