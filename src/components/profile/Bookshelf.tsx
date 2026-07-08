import { BookshelfCover } from "@/src/components/profile/BookshelfCover";
import { BookshelfOverflow } from "@/src/components/profile/BookshelfOverflow";
import {
  SHELF_DISPLAY_LIMIT,
  SHELF_POSES,
} from "@/src/components/profile/bookshelf-poses";
import type { CurrentlyReadingBook } from "@/src/types/list";

export interface BookshelfProps {
  books: CurrentlyReadingBook[];
}

export function Bookshelf({ books }: BookshelfProps) {
  const overflowCount = Math.max(0, books.length - SHELF_DISPLAY_LIMIT);
  const visibleBooks = books.slice(0, SHELF_DISPLAY_LIMIT);
  const slotCount = overflowCount > 0 ? SHELF_DISPLAY_LIMIT + 1 : visibleBooks.length;

  return (
    <div className="bookshelf">
      <div className="flex min-h-[8.5rem] items-end justify-center gap-2 px-2 pb-1 sm:gap-3 md:min-h-[11rem] md:justify-start md:gap-4 md:px-0">
        {visibleBooks.map((book, index) => (
          <BookshelfCover
            key={book.entryId}
            bookId={book.bookId}
            title={book.title}
            coverUrl={book.coverUrl}
            pose={SHELF_POSES[index] ?? SHELF_POSES[0]!}
          />
        ))}
        {overflowCount > 0 ? (
          <BookshelfOverflow
            count={overflowCount}
            pose={SHELF_POSES[SHELF_DISPLAY_LIMIT] ?? SHELF_POSES[0]!}
          />
        ) : null}
        {slotCount === 0 ? (
          <p className="pb-6 text-center text-sm text-[var(--color-muted)]">
            Nothing on your shelf yet. Search for a book to get started.
          </p>
        ) : null}
      </div>
      {slotCount > 0 ? <div className="bookshelf-ledge" aria-hidden="true" /> : null}
    </div>
  );
}
