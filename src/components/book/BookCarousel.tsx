"use client";

import { useEffect, useMemo, useState } from "react";
import type { RelatedBook } from "@/src/types/book";
import { BookCard } from "@/src/components/book/BookCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@/src/components/ui/icons";

// Keep page size stable across SSR and hydration. Column count is handled in CSS
// (.similar-books-page uses 2 cols by default, 4 cols from 40rem).
const VISIBLE_COUNT = 4;

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

function getBooksKey(books: RelatedBook[]): string {
  return books.map((book) => book.bookId).join("|");
}

function BookCarouselInner({ books }: BookCarouselProps) {
  const [page, setPage] = useState(0);
  const pages = useMemo(() => chunkBooks(books, VISIBLE_COUNT), [books]);
  const lastPage = Math.max(pages.length - 1, 0);
  const activePage = Math.min(page, lastPage);

  useEffect(() => {
    if (page !== activePage) {
      setPage(activePage);
    }
  }, [page, activePage]);

  return (
    <div className="mt-5 min-w-0">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setPage((current) => current - 1)}
          disabled={activePage === 0}
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
            style={{ transform: `translateX(-${activePage * 100}%)` }}
          >
            {pages.map((pageBooks, pageIndex) => (
              <div
                key={pageBooks.map((book) => book.bookId).join("-")}
                className="similar-books-page"
                aria-hidden={pageIndex !== activePage}
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
          disabled={activePage >= lastPage}
          className="focus-ring shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-sm)] disabled:opacity-40"
          aria-label="Next books"
        >
          <ChevronRightIcon className="h-4 w-4 text-[var(--color-ink)]" />
        </button>
      </div>
    </div>
  );
}

export function BookCarousel({ books }: BookCarouselProps) {
  return <BookCarouselInner key={getBooksKey(books)} books={books} />;
}
