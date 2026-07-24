"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ListPrivacyIcon } from "@/src/components/lists/ListPrivacyIcon";
import { QuillSpinner } from "@/src/components/ui/QuillSpinner";
import { useCreateList } from "@/src/hooks/use-create-list";
import { READING_STATUS_OPTIONS } from "@/src/lib/lists/reading-status-map";
import type { BookLibraryState } from "@/src/types/book-library";
import type { ReadingStatus } from "@/src/types/book";
import type { List } from "@/src/types/list";

export interface BookLibraryDialogProps {
  library: BookLibraryState | undefined;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (input: {
    readingStatus: ReadingStatus | null;
    customListIds: string[];
  }) => Promise<void>;
  onRemoveFromLibrary: () => Promise<void>;
}

export function BookLibraryDialog({
  library,
  isOpen,
  isSaving,
  onClose,
  onSave,
  onRemoveFromLibrary,
}: BookLibraryDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const readingStatusLegendId = useId();
  const customListsLegendId = useId();

  const [readingStatus, setReadingStatus] = useState<ReadingStatus | null>(null);
  const [customListIds, setCustomListIds] = useState<string[]>([]);
  const [customLists, setCustomLists] = useState<List[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [isNewListOpen, setIsNewListOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListIsPrivate, setNewListIsPrivate] = useState(false);
  const [newListError, setNewListError] = useState<string | null>(null);
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);

  const createList = useCreateList();

  const isInLibrary = Boolean(
    library &&
      (library.readingStatus !== null || library.customListIds.length > 0),
  );

  useEffect(() => {
    if (!isOpen || !library) {
      return;
    }

    setReadingStatus(library.readingStatus);
    setCustomListIds(library.customListIds);
    setCustomLists(library.customLists);
    setError(null);
    setIsNewListOpen(false);
    setNewListName("");
    setNewListIsPrivate(false);
    setNewListError(null);
    setIsConfirmingRemove(false);
    dialogRef.current?.showModal();
  }, [isOpen, library]);

  useEffect(() => {
    if (!isOpen) {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const closeDialog = () => {
    onClose();
  };

  const toggleCustomList = (listId: string) => {
    setCustomListIds((current) =>
      current.includes(listId)
        ? current.filter((id) => id !== listId)
        : [...current, listId],
    );
  };

  const handleCreateList = async (event: React.FormEvent) => {
    event.preventDefault();
    setNewListError(null);

    const trimmed = newListName.trim();

    if (!trimmed) {
      setNewListError("Name is required");
      return;
    }

    try {
      const list = await createList.mutateAsync({
        name: trimmed,
        isPrivate: newListIsPrivate,
      });
      setCustomLists((current) => [...current, list]);
      setCustomListIds((current) => [...current, list.id]);
      setNewListName("");
      setNewListIsPrivate(false);
      setIsNewListOpen(false);
    } catch (createError) {
      setNewListError(
        createError instanceof Error ? createError.message : "Unable to create list",
      );
    }
  };

  const handleSave = async () => {
    setError(null);

    try {
      await onSave({ readingStatus, customListIds });
      closeDialog();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to save changes",
      );
    }
  };

  const handleRemove = async () => {
    setError(null);

    try {
      await onRemoveFromLibrary();
      closeDialog();
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove from library",
      );
    }
  };

  if (!isOpen || !library) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-modal="true"
      className="book-library-dialog"
      onClose={closeDialog}
    >
      <div
        className="flex h-full w-full items-center justify-center p-4"
        onClick={(event) => {
          if (event.target === event.currentTarget && !isSaving) {
            closeDialog();
          }
        }}
      >
        <div
          className="flex max-h-[calc(100vh-2rem)] w-[min(calc(100vw-2rem),28rem)] flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)]"
          onClick={(event) => event.stopPropagation()}
        >
        <header className="border-b border-[var(--color-border)] px-6 py-5">
          <h2
            id={titleId}
            className="text-display text-lg tracking-tight text-[var(--color-ink)]"
          >
            Add to your library
          </h2>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          <section aria-labelledby={readingStatusLegendId} className="mb-8">
            <h3
              id={readingStatusLegendId}
              className="text-sm font-medium text-[var(--color-ink)]"
            >
              Reading status
            </h3>
            <ul className="mt-3 space-y-1">
              {READING_STATUS_OPTIONS.map((option) => {
                const inputId = `reading-status-${option.status}`;

                return (
                  <li key={option.status}>
                    <label
                      htmlFor={inputId}
                      onClick={(event) => {
                        if (readingStatus === option.status) {
                          event.preventDefault();
                          setReadingStatus(null);
                        }
                      }}
                      className={`focus-ring flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                        readingStatus === option.status
                          ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                          : "border-transparent text-[var(--color-ink)] hover:bg-[var(--color-accent-soft)]/60"
                      }`}
                    >
                      <input
                        id={inputId}
                        type="radio"
                        name="reading-status"
                        checked={readingStatus === option.status}
                        onChange={() => setReadingStatus(option.status)}
                        className="size-4 shrink-0 accent-[var(--color-accent)]"
                      />
                      <span>{option.label}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby={customListsLegendId}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3
                id={customListsLegendId}
                className="text-sm font-medium text-[var(--color-ink)]"
              >
                Custom lists
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsNewListOpen((open) => !open);
                  setNewListError(null);
                }}
                className="focus-ring rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-accent-soft)]"
              >
                {isNewListOpen ? "Cancel" : "New list"}
              </button>
            </div>

            {isNewListOpen ? (
              <form
                onSubmit={(event) => void handleCreateList(event)}
                className="mb-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
              >
                <label
                  htmlFor="library-new-list-name"
                  className="block text-sm text-[var(--color-ink-secondary)]"
                >
                  Name
                </label>
                <input
                  id="library-new-list-name"
                  name="listName"
                  type="text"
                  value={newListName}
                  onChange={(event) => setNewListName(event.target.value)}
                  maxLength={100}
                  autoComplete="off"
                  autoFocus
                  className="focus-ring mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)]"
                />
                <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-[var(--color-ink)]">
                  <input
                    type="checkbox"
                    checked={newListIsPrivate}
                    onChange={(event) => setNewListIsPrivate(event.target.checked)}
                    className="size-4 rounded border-[var(--color-border)]"
                  />
                  Private list
                </label>
                {newListError ? (
                  <p className="mt-2 text-sm text-[#8b3a3a]" role="alert">
                    {newListError}
                  </p>
                ) : null}
                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={createList.isPending}
                    className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {createList.isPending ? (
                      <>
                        <QuillSpinner size="sm" decorative />
                        Creating…
                      </>
                    ) : (
                      "Create list"
                    )}
                  </button>
                </div>
              </form>
            ) : null}

            {customLists.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">
                No custom lists yet. Create one to group books your way.
              </p>
            ) : (
              <ul className="space-y-1">
                {customLists.map((list) => {
                  const inputId = `custom-list-${list.id}`;
                  const isChecked = customListIds.includes(list.id);

                  return (
                    <li key={list.id}>
                      <label
                        htmlFor={inputId}
                        className={`focus-ring flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                          isChecked
                            ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-ink)]"
                            : "border-transparent text-[var(--color-ink)] hover:bg-[var(--color-accent-soft)]/60"
                        }`}
                      >
                        <input
                          id={inputId}
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCustomList(list.id)}
                          className="size-4 shrink-0 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
                        />
                        <span className="min-w-0 flex-1 truncate">{list.name}</span>
                        <ListPrivacyIcon isPrivate={list.isPrivate} />
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {error ? (
            <p className="mt-4 text-sm text-[#8b3a3a]" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="border-t border-[var(--color-border)] px-6 py-4">
          {isConfirmingRemove ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-[var(--color-ink-secondary)]">
                Remove this book from all lists?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmingRemove(false)}
                  disabled={isSaving}
                  className="focus-ring flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-accent-soft)] disabled:opacity-60"
                >
                  Keep in library
                </button>
                <button
                  type="button"
                  onClick={() => void handleRemove()}
                  disabled={isSaving}
                  className="focus-ring inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#8b3a3a] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <QuillSpinner size="sm" decorative />
                      Removing…
                    </>
                  ) : (
                    "Confirm remove"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              {isInLibrary ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmingRemove(true)}
                  disabled={isSaving}
                  className="focus-ring rounded-lg px-3 py-2 text-sm text-[#8b3a3a] transition-colors hover:bg-[#8b3a3a]/10 disabled:opacity-60"
                >
                  Remove from library
                </button>
              ) : (
                <span aria-hidden="true" />
              )}
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={isSaving}
                  className="focus-ring rounded-lg px-4 py-2 text-sm text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={isSaving}
                  className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <QuillSpinner size="sm" decorative />
                      Saving…
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          )}
        </footer>
        </div>
      </div>
    </dialog>
  );
}
