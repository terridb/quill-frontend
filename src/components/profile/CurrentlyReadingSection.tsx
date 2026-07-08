import { Bookshelf } from "@/src/components/profile/Bookshelf";
import { FutureNavLink } from "@/src/components/profile/FutureNavLink";
import type { CurrentlyReadingBook } from "@/src/types/list";

export interface CurrentlyReadingSectionProps {
  books: CurrentlyReadingBook[];
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

export function CurrentlyReadingSection({
  books,
  isLoading = false,
  isError = false,
  onRetry,
}: CurrentlyReadingSectionProps) {
  const count = books.length;

  return (
    <section aria-labelledby="currently-reading-heading">
      <div className="mb-6 flex items-baseline justify-between gap-4 md:mb-8">
        <h2
          id="currently-reading-heading"
          className="text-display text-balance text-xl tracking-tight text-[var(--color-ink)] md:text-[1.55rem]"
        >
          Currently Reading {count}
        </h2>
        <FutureNavLink label="See all ›" />
      </div>

      {isLoading ? <BookshelfSkeleton /> : null}

      {!isLoading && isError ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-6 text-center">
          <p className="text-sm text-[var(--color-ink-secondary)]">
            Couldn&apos;t load your shelf. Check your connection and try again.
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

      {!isLoading && !isError ? <Bookshelf books={books} /> : null}
    </section>
  );
}
