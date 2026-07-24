"use client";

import { BookSearchResultItem } from "@/src/components/search/BookSearchResultItem";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { ErrorState } from "@/src/components/ui/ErrorState";
import { LoadingState } from "@/src/components/ui/LoadingState";
import { QuillSpinner } from "@/src/components/ui/QuillSpinner";
import { useBookSearch } from "@/src/hooks/use-book-search";
import { useSearch } from "@/src/providers/search-provider";

export interface BookSearchResultsListProps {
  className?: string;
}

export function BookSearchResultsList({
  className = "",
}: BookSearchResultsListProps) {
  const { query, debouncedQuery } = useSearch();
  const { data, isPending, isError, refetch, isFetching, isPlaceholderData } =
    useBookSearch(debouncedQuery);

  const isDebouncing = query.length >= 2 && query !== debouncedQuery;
  const isSearching = isDebouncing || isFetching;

  if (query.length < 2) {
    return (
      <EmptyState
        className={className}
        title="Search for a book by title or author"
      />
    );
  }

  // First fetch (no cached/placeholder rows yet).
  if (isPending || (isFetching && data == null)) {
    return (
      <LoadingState className={className} variant="skeleton" rowCount={5} />
    );
  }

  if (isError && !isSearching) {
    return (
      <ErrorState
        className={className}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const books = data ?? [];
  const showStaleResults =
    books.length > 0 && (isDebouncing || isPlaceholderData);

  // No rows for this query yet — otter while debounce/fetch settles.
  if (books.length === 0 && isSearching) {
    return <LoadingState className={className} />;
  }

  if (books.length === 0) {
    return <EmptyState className={className} title="No books found" />;
  }

  return (
    <div className={`relative ${className}`}>
      {isSearching ? (
        <div className="pointer-events-none absolute top-1 right-1 z-10">
          <QuillSpinner size="sm" />
        </div>
      ) : null}
      <ul
        className={`divide-y divide-[var(--color-border)] ${
          showStaleResults ? "opacity-60" : ""
        }`}
        aria-busy={isSearching}
        aria-live="polite"
      >
        {books.map((book) => (
          <BookSearchResultItem key={book.bookId} book={book} />
        ))}
      </ul>
    </div>
  );
}
