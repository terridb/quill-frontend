import { BookshelfCover } from "@/src/components/lists/BookshelfCover";
import { BookshelfEmpty } from "@/src/components/lists/BookshelfEmpty";
import { BookshelfOverflow } from "@/src/components/lists/BookshelfOverflow";
import {
  SHELF_DISPLAY_LIMIT,
  SHELF_POSES,
} from "@/src/components/lists/bookshelf-poses";
import type { ListBook } from "@/src/types/list";

export interface BookshelfProps {
  books: ListBook[];
  listName?: string;
}

export function Bookshelf({ books, listName }: BookshelfProps) {
  if (books.length === 0) {
    return <BookshelfEmpty listName={listName} />;
  }

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
      </div>
      {slotCount > 0 ? <div className="bookshelf-ledge" aria-hidden="true" /> : null}
    </div>
  );
}
