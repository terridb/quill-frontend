import type { RelatedBook } from "@/src/types/book";
import { getBookPath } from "@/src/lib/books/book-path";
import Image from "next/image";
import Link from "next/link";

export interface BookCardProps {
  book: RelatedBook;
  className?: string;
}

export function BookCard({ book, className = "" }: BookCardProps) {
  return (
    <Link
      href={getBookPath(book.bookId, book.title)}
      className={`group focus-ring block min-w-0 w-full transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 ${className}`}
    >
      <div className="relative mb-2 aspect-[2/3] w-full overflow-hidden rounded-md bg-[var(--color-fill)] shadow-[var(--shadow-cover)] transition-shadow duration-200 group-hover:shadow-[var(--shadow-md)]">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 45vw, 160px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-1 text-center text-[10px] leading-tight text-[var(--color-muted)]">
            No cover
          </div>
        )}
      </div>
      <p className="text-display line-clamp-2 text-sm leading-snug text-[var(--color-ink)] transition-colors duration-200 group-hover:text-[var(--color-accent)]">
        {book.title}
      </p>
      <p className="mt-1 truncate text-xs text-[var(--color-muted)]">{book.authors}</p>
    </Link>
  );
}
