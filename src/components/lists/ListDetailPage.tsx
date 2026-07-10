"use client";

import Link from "next/link";
import { BookCard } from "@/src/components/book/BookCard";
import { ListBooksEmpty } from "@/src/components/lists/ListBooksEmpty";
import { ListPrivacyIcon } from "@/src/components/lists/ListPrivacyIcon";
import { useListDetail } from "@/src/hooks/use-list-detail";
import type { ListDetail } from "@/src/types/list";

export interface ListDetailPageProps {
  listId: string;
  initialDetail: ListDetail;
}

export function ListDetailPage({ listId, initialDetail }: ListDetailPageProps) {
  const { data, isLoading, isError, refetch } = useListDetail(listId, initialDetail);
  const detail = data ?? initialDetail;
  const { list, books } = detail;

  return (
    <div>
      <Link
        href="/lists"
        className="focus-ring mb-6 inline-block text-sm text-[var(--color-accent)] underline-offset-2 hover:underline"
      >
        ← All lists
      </Link>

      <div className="mb-8 flex items-start gap-3 md:mb-10">
        <ListPrivacyIcon isPrivate={list.isPrivate} className="mt-1.5" />
        <div>
          <h1 className="text-display text-2xl tracking-tight text-[var(--color-ink)] md:text-3xl">
            {list.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {books.length} {books.length === 1 ? "book" : "books"}
          </p>
        </div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-6 text-center">
          <p className="text-sm text-[var(--color-ink-secondary)]">
            Couldn&apos;t load this list. Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="focus-ring mt-3 text-sm font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : null}

      {!isError && isLoading && books.length === 0 ? (
        <div
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          aria-hidden="true"
        >
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="animate-pulse">
              <div className="mb-2 aspect-[2/3] rounded-md bg-[var(--color-fill)]" />
              <div className="h-4 rounded bg-[var(--color-fill)]" />
            </div>
          ))}
        </div>
      ) : null}

      {!isError && books.length === 0 && !isLoading ? (
        <ListBooksEmpty listName={list.name} />
      ) : null}

      {!isError && books.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {books.map((book) => (
            <li key={book.entryId}>
              <BookCard book={book} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
