"use client";

import { CustomListsSection } from "@/src/components/lists/CustomListsSection";
import { ListBookshelfSection } from "@/src/components/lists/ListBookshelfSection";
import { useListsOverview } from "@/src/hooks/use-lists-overview";
import type { ListsOverview } from "@/src/types/list";

export interface ListsOverviewPageProps {
  initialOverview: ListsOverview;
}

export function ListsOverviewPage({ initialOverview }: ListsOverviewPageProps) {
  const { data, isLoading, isError, refetch } = useListsOverview(initialOverview);
  const overview = data ?? initialOverview;

  return (
    <div>
      <h1 className="text-display mb-10 text-2xl tracking-tight text-[var(--color-ink)] md:mb-12 md:text-3xl">
        Your lists
      </h1>

      <section aria-labelledby="reading-status-heading" className="mb-12 md:mb-16">
        <h2
          id="reading-status-heading"
          className="text-display mb-8 text-lg tracking-tight text-[var(--color-ink-secondary)] md:text-xl"
        >
          Reading status lists
        </h2>

        {isError ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-6 text-center">
            <p className="text-sm text-[var(--color-ink-secondary)]">
              Couldn&apos;t load your lists. Check your connection and try again.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="focus-ring mt-3 text-sm font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          overview.defaultLists.map((list) => (
            <ListBookshelfSection
              key={list.id}
              headingId={`list-heading-${list.id}`}
              title={list.name}
              isPrivate={list.isPrivate}
              books={list.books}
              seeAllHref={`/lists/${list.id}`}
              isLoading={isLoading && list.books.length === 0}
            />
          ))
        )}
      </section>

      <div
        className="mb-12 border-t border-[var(--color-border)] md:mb-16"
        role="separator"
        aria-hidden="true"
      />

      <CustomListsSection lists={overview.customLists} isLoading={isLoading} />
    </div>
  );
}
