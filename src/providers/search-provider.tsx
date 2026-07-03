"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useDebouncedValue } from "@/src/hooks/use-debounced-value";

interface SearchContextValue {
  query: string;
  setQuery: (query: string) => void;
  debouncedQuery: string;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);

  const value = useMemo(
    () => ({
      query,
      setQuery,
      debouncedQuery,
    }),
    [query, debouncedQuery],
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
