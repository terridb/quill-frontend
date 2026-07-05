"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { bookKeys } from "@/src/hooks/book-keys";
import { fetchBookSearch } from "@/src/lib/openlibrary/fetch-book-search";

export { bookKeys };

export function useBookSearch(debouncedQuery: string) {
  return useQuery({
    queryKey: bookKeys.search(debouncedQuery),
    queryFn: () => fetchBookSearch(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
