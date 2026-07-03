"use client";

import { BookSearchResultsList } from "@/src/components/search/BookSearchResultsList";
import { SearchInput } from "@/src/components/ui/SearchInput";
import { useSearch } from "@/src/providers/search-provider";

export function BookSearchMobilePage() {
  const { query, setQuery } = useSearch();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-display text-[1.875rem] leading-tight tracking-tight text-[var(--color-ink)]">
          Find a book
        </h1>
        <p className="text-label mt-1.5">Search by title or author</p>
      </header>

      <div role="search">
        <SearchInput
          id="mobile-book-search"
          value={query}
          onChange={setQuery}
        />
      </div>

      <BookSearchResultsList />
    </div>
  );
}
