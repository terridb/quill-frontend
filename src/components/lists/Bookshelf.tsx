"use client";

import { useRef } from "react";
import { BookshelfCover } from "@/src/components/lists/BookshelfCover";
import { BookshelfEmpty } from "@/src/components/lists/BookshelfEmpty";
import { BookshelfOverflow } from "@/src/components/lists/BookshelfOverflow";
import { SHELF_POSES } from "@/src/components/lists/bookshelf-poses";
import { useShelfLayout } from "@/src/hooks/use-shelf-layout";
import type { ListBook } from "@/src/types/list";

export interface BookshelfProps {
  books: ListBook[];
  listName?: string;
}

export function Bookshelf({ books, listName }: BookshelfProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const { visibleCount, spineWidth, gap, overflowCount, minHeight } = useShelfLayout(
    books.length,
    rowRef,
  );

  if (books.length === 0) {
    return <BookshelfEmpty listName={listName} />;
  }

  const visibleBooks = books.slice(0, visibleCount);
  const slotCount = overflowCount > 0 ? visibleCount + 1 : visibleBooks.length;

  return (
    <div className="bookshelf">
      <div
        ref={rowRef}
        className="flex w-full items-end justify-start pt-2.5 pb-0.5"
        style={{
          gap,
          minHeight,
        }}
      >
        {visibleBooks.map((book, index) => (
          <BookshelfCover
            key={book.entryId}
            bookId={book.bookId}
            title={book.title}
            coverUrl={book.coverUrl}
            pose={SHELF_POSES[index] ?? SHELF_POSES[0]!}
            spineWidth={spineWidth}
          />
        ))}
        {overflowCount > 0 ? (
          <BookshelfOverflow
            count={overflowCount}
            pose={SHELF_POSES[visibleCount] ?? SHELF_POSES[0]!}
            spineWidth={spineWidth}
          />
        ) : null}
      </div>
      {slotCount > 0 ? <div className="bookshelf-ledge" aria-hidden="true" /> : null}
    </div>
  );
}
