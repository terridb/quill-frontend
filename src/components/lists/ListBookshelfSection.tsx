import Link from "next/link";
import { Bookshelf } from "@/src/components/lists/Bookshelf";
import { BookshelfSkeleton } from "@/src/components/lists/BookshelfSkeleton";
import { ListPrivacyIcon } from "@/src/components/lists/ListPrivacyIcon";
import type { ListBook } from "@/src/types/list";

export interface ListBookshelfSectionProps {
  title: string;
  isPrivate: boolean;
  books: ListBook[];
  seeAllHref: string;
  headingId: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function ListBookshelfSection({
  title,
  isPrivate,
  books,
  seeAllHref,
  headingId,
  isLoading = false,
  isError = false,
  onRetry,
}: ListBookshelfSectionProps) {
  const count = books.length;

  return (
    <section aria-labelledby={headingId} className="mb-10 min-w-0 md:mb-12">
      <div className="mb-6 flex min-w-0 items-baseline justify-between gap-4 md:mb-8">
        <h2
          id={headingId}
          className="text-display min-w-0 text-balance text-xl tracking-tight text-[var(--color-ink)] md:text-[1.55rem]"
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <ListPrivacyIcon isPrivate={isPrivate} className="shrink-0" />
            <span className="truncate">{title}</span>
          </span>
          <span className="ml-4 align-middle text-[0.8em] font-medium tracking-[0.08em] text-[var(--color-accent)]">
            {count}
          </span>
        </h2>
        <Link
          href={seeAllHref}
          className="focus-ring shrink-0 text-sm text-[var(--color-accent)] underline-offset-2 hover:underline"
        >
          See all ›
        </Link>
      </div>

      {isLoading ? <BookshelfSkeleton /> : null}

      {!isLoading && isError ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-6 text-center">
          <p className="text-sm text-[var(--color-ink-secondary)]">
            Couldn&apos;t load this shelf. Check your connection and try again.
          </p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="focus-ring mt-3 text-sm font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
            >
              Try again
            </button>
          ) : null}
        </div>
      ) : null}

      {!isLoading && !isError ? <Bookshelf books={books} listName={title} /> : null}
    </section>
  );
}
