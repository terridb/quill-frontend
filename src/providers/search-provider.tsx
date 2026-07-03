"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { useDebouncedValue } from "@/src/hooks/use-debounced-value";
import { useBookSearch } from "@/src/hooks/use-book-search";
import type { BookSearchResult } from "@/src/types/open-library";

interface SearchContextValue {
  query: string;
  setQuery: (query: string) => void;
  debouncedQuery: string;
  searchQuery: UseQueryResult<BookSearchResult[], Error>;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const searchQuery = useBookSearch(debouncedQuery);

  const value = useMemo(
    () => ({
      query,
      setQuery,
      debouncedQuery,
      searchQuery,
    }),
    [query, debouncedQuery, searchQuery],
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("useSearch must be used within SearchProvider");
  }

  return context;
}
