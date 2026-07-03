"use client";

import { useEffect } from "react";
import { BookSearchResultsList } from "@/src/components/search/BookSearchResultsList";
import { SearchInput } from "@/src/components/ui/SearchInput";
import { useSearch } from "@/src/providers/search-provider";

export function BookSearchMobilePage() {
  const { query, setQuery } = useSearch();

  useEffect(() => {
    const { documentElement, body } = document;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    documentElement.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      documentElement.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-20 flex flex-col bg-[var(--color-bg)] bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))]">
      <div className="mx-auto flex w-full max-w-2xl shrink-0 flex-col gap-6 px-5 pt-[calc(1.75rem+env(safe-area-inset-top,0px))] pb-6">
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
      </div>

      <div className="mx-auto min-h-0 w-full max-w-2xl flex-1 overflow-y-auto overscroll-y-contain px-5 pb-7">
        <BookSearchResultsList />
      </div>
    </div>
  );
}
