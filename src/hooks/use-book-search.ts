"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchBookSearch } from "@/src/lib/openlibrary/fetch-book-search";

export const bookKeys = {
  all: ["books"] as const,
  search: (query: string) => [...bookKeys.all, "search", query] as const,
};

export function useBookSearch(debouncedQuery: string) {
  return useQuery({
    queryKey: bookKeys.search(debouncedQuery),
    queryFn: () => fetchBookSearch(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
