"use client";

import { BookSearchResultItem } from "@/src/components/search/BookSearchResultItem";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { ErrorState } from "@/src/components/ui/ErrorState";
import { LoadingState } from "@/src/components/ui/LoadingState";
import { useBookSearch } from "@/src/hooks/use-book-search";
import { useSearch } from "@/src/providers/search-provider";

export interface BookSearchResultsListProps {
  className?: string;
}

export function BookSearchResultsList({
  className = "",
}: BookSearchResultsListProps) {
  const { query, debouncedQuery } = useSearch();
  const { data, isPending, isError, refetch, isFetching } =
    useBookSearch(debouncedQuery);

  if (query.length < 2) {
    return (
      <EmptyState
        className={className}
        title="Search for a book by title or author"
      />
    );
  }

  if (isPending || (isFetching && !data)) {
    return (
      <LoadingState className={className} variant="skeleton" rowCount={5} />
    );
  }

  if (isError) {
    return (
      <ErrorState
        className={className}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState className={className} title="No books found" />;
  }

  return (
    <ul className={`divide-y divide-[var(--color-border)] ${className}`} aria-live="polite">
      {data.map((book) => (
        <BookSearchResultItem key={book.id} book={book} />
      ))}
    </ul>
  );
}
