import Image from "next/image";
import Link from "next/link";
import { CheckIcon } from "@/src/components/ui/icons";
import { getBookPath } from "@/src/lib/books/book-path";
import type { ListBook } from "@/src/types/list";

export interface ListBookCardProps {
  book: ListBook;
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (entryId: string) => void;
  className?: string;
}

export function ListBookCard({
  book,
  selectMode = false,
  selected = false,
  onToggleSelect,
  className = "",
}: ListBookCardProps) {
  const cover = (
    <div
      className={`relative mb-2 aspect-[2/3] w-full overflow-hidden rounded-md bg-[var(--color-fill)] shadow-[var(--shadow-cover)] transition-[box-shadow,opacity] duration-200 ${
        selectMode
          ? selected
            ? "ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg)]"
            : "opacity-90"
          : "group-hover:shadow-[var(--shadow-md)]"
      }`}
    >
      {book.coverUrl ? (
        <Image
          src={book.coverUrl}
          alt=""
          fill
          sizes="(max-width: 640px) 45vw, 160px"
          className="object-cover"
          quality={85}
        />
      ) : (
        <div className="flex h-full items-center justify-center px-1 text-center text-[10px] leading-tight text-[var(--color-muted)]">
          No cover
        </div>
      )}

      {selectMode ? (
        <span
          className={`absolute top-2 right-2 flex size-7 items-center justify-center rounded-full shadow-sm ${
            selected
              ? "bg-[var(--color-accent)] text-[var(--color-surface)]"
              : "border border-[var(--color-border)] bg-[var(--color-surface)]/95 text-transparent"
          }`}
          aria-hidden="true"
        >
          <CheckIcon className="size-3.5" />
        </span>
      ) : null}
    </div>
  );

  const meta = (
    <>
      <p
        className={`text-display line-clamp-2 text-sm leading-snug text-[var(--color-ink)] transition-colors duration-200 ${
          selectMode ? "" : "group-hover:text-[var(--color-accent)]"
        }`}
      >
        {book.title}
      </p>
      <p className="mt-1 truncate text-xs text-[var(--color-muted)]">{book.authors}</p>
    </>
  );

  if (selectMode) {
    return (
      <button
        type="button"
        onClick={() => onToggleSelect?.(book.entryId)}
        aria-pressed={selected}
        aria-label={
          selected
            ? `Deselect ${book.title}`
            : `Select ${book.title} for removal`
        }
        className={`focus-ring block min-w-0 w-full text-left ${className}`}
      >
        {cover}
        {meta}
      </button>
    );
  }

  return (
    <Link
      href={getBookPath(book.bookId, book.title)}
      className={`group focus-ring block min-w-0 w-full transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 ${className}`}
    >
      {cover}
      {meta}
    </Link>
  );
}
