import type { BookSearchResult } from "@/src/types/open-library";
import { getBookPath } from "@/src/lib/openlibrary/book-path";
import Image from "next/image";
import Link from "next/link";

export interface BookSearchResultItemProps {
  book: BookSearchResult;
}

export function BookSearchResultItem({ book }: BookSearchResultItemProps) {
  return (
    <li className="border-b border-[var(--color-border)] last:border-b-0">
      <Link
        href={getBookPath(book.openLibraryId, book.title)}
        className="group focus-ring -mx-1 flex cursor-pointer gap-4 rounded-xl px-3 py-4 transition-colors duration-200 hover:bg-[var(--color-accent-soft)]"
      >
        <div className="relative h-[5.25rem] w-[3.25rem] shrink-0 overflow-hidden rounded-md bg-[var(--color-fill)] shadow-[var(--shadow-cover)] transition-[transform,box-shadow] duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-md)]">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt=""
              fill
              sizes="52px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-1 text-center text-[10px] leading-tight text-[var(--color-muted)]">
              No cover
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 self-center">
          <p className="text-display line-clamp-2 text-[1.0625rem] leading-snug text-[var(--color-ink)] transition-colors duration-200 group-hover:text-[var(--color-accent)]">
            {book.title}
          </p>
          <p className="mt-1.5 truncate text-sm text-[var(--color-muted)] transition-colors duration-200 group-hover:text-[var(--color-ink-secondary)]">
            {book.authors}
          </p>
        </div>
      </Link>
    </li>
  );
}
