"use client";

import { useEffect, useMemo, useState } from "react";
import type { RelatedBook } from "@/src/types/book";
import { BookCard } from "@/src/components/book/BookCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@/src/components/ui/icons";
import { useMediaQuery } from "@/src/hooks/use-media-query";

const MOBILE_VISIBLE_COUNT = 2;
const DESKTOP_VISIBLE_COUNT = 4;
const DESKTOP_MEDIA_QUERY = "(min-width: 40rem)";

export interface BookCarouselProps {
  books: RelatedBook[];
}

function chunkBooks(books: RelatedBook[], size: number): RelatedBook[][] {
  const pages: RelatedBook[][] = [];

  for (let index = 0; index < books.length; index += size) {
    pages.push(books.slice(index, index + size));
  }

  return pages;
}

export function BookCarousel({ books }: BookCarouselProps) {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const visibleCount = isDesktop ? DESKTOP_VISIBLE_COUNT : MOBILE_VISIBLE_COUNT;
  const [page, setPage] = useState(0);
  const pages = useMemo(
    () => chunkBooks(books, visibleCount),
    [books, visibleCount],
  );
  const totalPages = pages.length;

  useEffect(() => {
    setPage(0);
  }, [books, visibleCount]);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(totalPages - 1, 0));
    }
  }, [page, totalPages]);

  return (
    <div className="mt-5 min-w-0">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setPage((current) => current - 1)}
          disabled={page === 0}
          className="focus-ring shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-sm)] disabled:opacity-40"
          aria-label="Previous books"
        >
          <ChevronLeftIcon className="h-4 w-4 text-[var(--color-ink)]" />
        </button>
        <div
          className="similar-books-viewport min-w-0 flex-1"
          role="region"
          aria-label="Book carousel"
          aria-live="polite"
        >
          <div
            className="similar-books-track"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {pages.map((pageBooks, pageIndex) => (
              <div
                key={pageBooks.map((book) => book.bookId).join("-")}
                className="similar-books-page"
                aria-hidden={pageIndex !== page}
              >
                {pageBooks.map((book) => (
                  <BookCard key={book.bookId} book={book} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPage((current) => current + 1)}
          disabled={page >= totalPages - 1}
          className="focus-ring shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-sm)] disabled:opacity-40"
          aria-label="Next books"
        >
          <ChevronRightIcon className="h-4 w-4 text-[var(--color-ink)]" />
        </button>
      </div>
    </div>
  );
}
