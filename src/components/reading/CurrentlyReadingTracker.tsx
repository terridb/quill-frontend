"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookCover } from "@/src/components/book/BookCover";
import { TrackerProgressPanel } from "@/src/components/reading/TrackerProgressPanel";
import { WeeklyActivityStrip } from "@/src/components/reading/WeeklyActivityStrip";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FlameIcon,
} from "@/src/components/ui/icons";
import { useReadingTracker } from "@/src/hooks/use-reading-tracker";
import { getBookPath } from "@/src/lib/books/book-path";
import type { ReadingTrackerData, TrackerBook } from "@/src/types/reading-tracker";

export interface CurrentlyReadingTrackerProps {
  initialTracker: ReadingTrackerData;
}

function TrackerCover({ book }: { book: TrackerBook }) {
  return (
    <Link
      href={getBookPath(book.bookId, book.title)}
      aria-label={book.title}
      className="reading-cover-anchor focus-ring"
    >
      <div className="reading-cover-anchor__frame">
        <BookCover
          coverUrl={book.coverUrl}
          title={book.title}
          className="reading-cover-anchor__image aspect-[2/3] w-full"
        />
        {book.progressPercent !== null ? (
          <span className="reading-cover-bookmark tabular-nums" aria-hidden="true">
            {book.progressPercent}%
          </span>
        ) : null}
        {book.readToday ? (
          <span className="reading-cover-done" aria-hidden="true">
            <CheckIcon className="size-2.5 text-white" />
          </span>
        ) : null}
      </div>
    </Link>
  );
}

export function CurrentlyReadingTracker({
  initialTracker,
}: CurrentlyReadingTrackerProps) {
  const { data: tracker } = useReadingTracker(initialTracker);
  const activeTracker = tracker ?? initialTracker;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const books = activeTracker.books;

  useEffect(() => {
    if (activeIndex >= books.length) {
      setActiveIndex(Math.max(0, books.length - 1));
    }
  }, [activeIndex, books.length]);

  useEffect(() => {
    setIsFormOpen(false);
  }, [activeIndex]);

  if (books.length === 0) {
    return null;
  }

  const safeIndex = Math.min(activeIndex, books.length - 1);
  const activeBook = books[safeIndex] ?? books[0];
  const showBookNav = books.length > 1;

  const goToPrevious = () => {
    setActiveIndex(safeIndex === 0 ? books.length - 1 : safeIndex - 1);
  };

  const goToNext = () => {
    setActiveIndex(safeIndex === books.length - 1 ? 0 : safeIndex + 1);
  };

  return (
    <section className="reading-tracker-widget" aria-label="Reading tracker">
      <header className="reading-tracker-widget__header">
        <div
          className="reading-streak-pill"
          aria-label={`${activeTracker.streak} day reading streak`}
        >
          <FlameIcon className="reading-streak-pill__icon size-4 shrink-0 text-[var(--color-accent)]" />
          <span className="reading-streak-pill__count text-display tabular-nums">
            {activeTracker.streak}
          </span>
          <span className="reading-streak-pill__label">
            day{activeTracker.streak === 1 ? "" : "s"}
          </span>
        </div>
        <WeeklyActivityStrip weekDays={activeTracker.weekDays} />
      </header>

      <div className="reading-tracker-widget__body">
        <div className="reading-tracker-widget__main min-w-0">
          {isFormOpen ? (
            <TrackerProgressPanel
              key={activeBook.entryId}
              book={activeBook}
              onSaved={() => setIsFormOpen(false)}
              onCancel={() => setIsFormOpen(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className={`focus-ring reading-tracker-cta${
                activeBook.readToday ? " reading-tracker-cta--logged" : ""
              }`}
            >
              {activeBook.readToday ? "Update progress" : "I read today"}
            </button>
          )}
        </div>

        <aside className="reading-tracker-widget__cover">
          <TrackerCover book={activeBook} />
        </aside>
      </div>

      {showBookNav ? (
        <footer className="reading-tracker-widget__footer">
          <button
            type="button"
            className="focus-ring reading-book-nav-btn"
            onClick={goToPrevious}
            aria-label="Previous book"
          >
            <ChevronLeftIcon className="size-3.5" />
          </button>
          <span
            className="reading-book-nav-label tabular-nums"
            aria-live="polite"
          >
            {safeIndex + 1} / {books.length}
          </span>
          <button
            type="button"
            className="focus-ring reading-book-nav-btn"
            onClick={goToNext}
            aria-label="Next book"
          >
            <ChevronRightIcon className="size-3.5" />
          </button>
        </footer>
      ) : null}
    </section>
  );
}
