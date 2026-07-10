import Link from "next/link";
import { Bookshelf } from "@/src/components/lists/Bookshelf";
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

function BookshelfSkeleton() {
  return (
    <div className="bookshelf" aria-hidden="true">
      <div className="flex min-h-[8.5rem] items-end justify-center gap-2 px-2 pb-1 sm:gap-3 md:min-h-[9.5rem]">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="aspect-[2/3] w-[3.5rem] shrink-0 animate-pulse rounded-md bg-[var(--color-fill)] sm:w-[4rem] md:w-[4.5rem]"
            style={{
              transform: `rotate(${index % 2 === 0 ? -3 : 2}deg)`,
              transformOrigin: "bottom center",
            }}
          />
        ))}
      </div>
      <div className="bookshelf-ledge" />
    </div>
  );
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
    <section aria-labelledby={headingId} className="mb-10 md:mb-12">
      <div className="mb-6 flex items-baseline justify-between gap-4 md:mb-8">
        <h2
          id={headingId}
          className="text-display text-balance text-xl tracking-tight text-[var(--color-ink)] md:text-[1.55rem]"
        >
          <span className="inline-flex items-center gap-2">
            <ListPrivacyIcon isPrivate={isPrivate} />
            <span>{title}</span>
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
