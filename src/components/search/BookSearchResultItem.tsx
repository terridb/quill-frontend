import type { BookSearchResult } from "@/src/types/open-library";
import Image from "next/image";

export interface BookSearchResultItemProps {
  book: BookSearchResult;
}

export function BookSearchResultItem({ book }: BookSearchResultItemProps) {
  return (
    <li className="flex gap-4 border-b border-[var(--color-border)] py-4 last:border-b-0">
      <div className="relative h-[5.25rem] w-[3.25rem] shrink-0 overflow-hidden rounded-md bg-[var(--color-fill)] shadow-[var(--shadow-cover)]">
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
        <p className="text-display line-clamp-2 text-[1.0625rem] leading-snug text-[var(--color-ink)]">
          {book.title}
        </p>
        <p className="mt-1.5 truncate text-sm text-[var(--color-muted)]">
          {book.authors}
        </p>
      </div>
    </li>
  );
}
