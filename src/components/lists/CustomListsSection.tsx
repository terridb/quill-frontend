"use client";

import { useId, useRef, useState } from "react";
import { ListBookshelfSection } from "@/src/components/lists/ListBookshelfSection";
import { ListsSectionHeading } from "@/src/components/lists/ListsSectionHeading";
import { useCreateList } from "@/src/hooks/use-create-list";
import type { ListWithBooks } from "@/src/types/list";

export interface CustomListsSectionProps {
  lists: ListWithBooks[];
  isLoading?: boolean;
}

export function CustomListsSection({ lists, isLoading = false }: CustomListsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const createList = useCreateList();

  const openDialog = () => {
    setName("");
    setIsPrivate(false);
    setError(null);
    setIsOpen(true);
    dialogRef.current?.showModal();
  };

  const closeDialog = () => {
    setIsOpen(false);
    dialogRef.current?.close();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmed = name.trim();

    if (!trimmed) {
      setError("Name is required");
      return;
    }

    try {
      await createList.mutateAsync({ name: trimmed, isPrivate });
      closeDialog();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to create list",
      );
    }
  };

  return (
    <section aria-labelledby="custom-lists-heading">
      <ListsSectionHeading
        id="custom-lists-heading"
        action={
          <button
            type="button"
            onClick={openDialog}
            className="focus-ring rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-accent-soft)]"
          >
            New list
          </button>
        }
      >
        Custom lists
      </ListsSectionHeading>

      {lists.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">
          No custom lists yet. Create one to group books your way.
        </p>
      ) : (
        lists.map((list) => (
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

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-modal="true"
        className="fixed top-1/2 left-1/2 w-[min(calc(100vw-2rem),24rem)] max-h-[calc(100vh-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-md)] backdrop:bg-black/40"
        onClose={() => setIsOpen(false)}
      >
        {isOpen ? (
          <form onSubmit={(event) => void handleSubmit(event)}>
            <h3
              id={titleId}
              className="text-display text-lg tracking-tight text-[var(--color-ink)]"
            >
              New list
            </h3>
            <div className="mt-4">
              <label htmlFor="list-name" className="block text-sm text-[var(--color-ink-secondary)]">
                Name
              </label>
              <input
                id="list-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                autoFocus
                className="focus-ring mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-ink)]"
              />
            </div>
            <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-[var(--color-ink)]">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(event) => setIsPrivate(event.target.checked)}
                className="size-4 rounded border-[var(--color-border)]"
              />
              Private list
            </label>
            {error ? (
              <p className="mt-3 text-sm text-[#8b3a3a]" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDialog}
                className="focus-ring rounded-lg px-4 py-2 text-sm text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createList.isPending}
                className="focus-ring rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {createList.isPending ? "Creating…" : "Create list"}
              </button>
            </div>
          </form>
        ) : null}
      </dialog>
    </section>
  );
}
