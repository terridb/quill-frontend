"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ListBookCard } from "@/src/components/lists/ListBookCard";
import { ListBooksEmpty } from "@/src/components/lists/ListBooksEmpty";
import { ListPrivacyIcon } from "@/src/components/lists/ListPrivacyIcon";
import { QuillSpinner } from "@/src/components/ui/QuillSpinner";
import { LoadingState } from "@/src/components/ui/LoadingState";
import { useListDetail } from "@/src/hooks/use-list-detail";
import { useRemoveListEntries } from "@/src/hooks/use-remove-list-entries";
import type { ListDetail } from "@/src/types/list";

export interface ListDetailPageProps {
  listId: string;
  initialDetail: ListDetail;
}

export function ListDetailPage({ listId, initialDetail }: ListDetailPageProps) {
  const { data, isLoading, isError, refetch } = useListDetail(listId, initialDetail);
  const detail = data ?? initialDetail;
  const { list, books, isOwner } = detail;

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [removeError, setRemoveError] = useState<string | null>(null);

  const removeEntries = useRemoveListEntries(listId);

  useEffect(() => {
    if (books.length === 0 && isSelecting) {
      setIsSelecting(false);
      setSelectedIds(new Set());
    }
  }, [books.length, isSelecting]);

  const exitSelectMode = () => {
    setIsSelecting(false);
    setSelectedIds(new Set());
    setRemoveError(null);
  };

  const toggleSelect = (entryId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }
      return next;
    });
  };

  const handleRemove = async () => {
    if (selectedIds.size === 0 || removeEntries.isPending) {
      return;
    }

    setRemoveError(null);
    const entryIds = [...selectedIds];

    try {
      await removeEntries.mutateAsync(entryIds);
      setSelectedIds(new Set());
      if (books.length <= entryIds.length) {
        setIsSelecting(false);
      }
    } catch (error) {
      setRemoveError(
        error instanceof Error ? error.message : "Unable to remove books from list",
      );
    }
  };

  const selectedCount = selectedIds.size;
  const showSelectControls = isOwner && books.length > 0;

  return (
    <div className={isSelecting ? "pb-24" : undefined}>
      <Link
        href="/lists"
        className="focus-ring mb-6 inline-block text-sm text-[var(--color-accent)] underline-offset-2 hover:underline"
      >
        ← All lists
      </Link>

      <div className="mb-8 flex items-start justify-between gap-4 md:mb-10">
        <div className="flex min-w-0 items-start gap-3">
          <ListPrivacyIcon isPrivate={list.isPrivate} className="mt-1.5" />
          <div className="min-w-0">
            <h1 className="text-display text-2xl tracking-tight text-[var(--color-ink)] md:text-3xl">
              {list.name}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {books.length} {books.length === 1 ? "book" : "books"}
              {isSelecting && selectedCount > 0
                ? ` · ${selectedCount} selected`
                : null}
            </p>
          </div>
        </div>

        {showSelectControls ? (
          <button
            type="button"
            onClick={() => {
              if (isSelecting) {
                exitSelectMode();
              } else {
                setIsSelecting(true);
                setRemoveError(null);
              }
            }}
            className="focus-ring shrink-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-accent-soft)] md:px-4"
          >
            {isSelecting ? "Done" : "Remove books"}
          </button>
        ) : null}
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

      {!isError && isLoading && books.length === 0 ? <LoadingState /> : null}

      {!isError && books.length === 0 && !isLoading ? (
        <ListBooksEmpty listName={list.name} />
      ) : null}

      {!isError && books.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {books.map((book) => (
            <li key={book.entryId}>
              <ListBookCard
                book={book}
                selectMode={isSelecting}
                selected={selectedIds.has(book.entryId)}
                onToggleSelect={toggleSelect}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {isSelecting && selectedCount > 0 ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-6">
          <div className="pointer-events-auto flex w-full max-w-md flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-3 shadow-[var(--shadow-md)] backdrop-blur-lg">
            {removeError ? (
              <p className="px-1 text-center text-sm text-red-700" role="alert">
                {removeError}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => void handleRemove()}
              disabled={removeEntries.isPending}
              className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#8b3a3a] px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {removeEntries.isPending ? (
                <>
                  <QuillSpinner size="sm" decorative />
                  Removing…
                </>
              ) : (
                `Remove ${selectedCount} ${selectedCount === 1 ? "book" : "books"}`
              )}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
