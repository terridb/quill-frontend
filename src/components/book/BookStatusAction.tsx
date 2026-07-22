"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { BookLibraryDialog } from "@/src/components/book/BookLibraryDialog";
import { ChevronDownIcon } from "@/src/components/ui/icons";
import { QuillSpinner } from "@/src/components/ui/QuillSpinner";
import { useBookLibrary } from "@/src/hooks/use-book-library";
import { READING_STATUS_LABELS } from "@/src/types/book";

interface BookStatusActionContextValue {
  openDialog: () => void;
  isOpen: boolean;
  isLoading: boolean;
  buttonLabel: string;
  isDisabled: boolean;
}

const BookStatusActionContext = createContext<BookStatusActionContextValue | null>(
  null,
);

function useBookStatusActionContext() {
  const context = useContext(BookStatusActionContext);

  if (!context) {
    throw new Error("BookStatusAction components must be used within BookStatusAction");
  }

  return context;
}

export interface BookStatusActionProps {
  bookId: string;
  children: ReactNode;
}

export function BookStatusAction({ bookId, children }: BookStatusActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    library,
    isLoading,
    isInLibrary,
    saveLibrary,
    isSaving,
  } = useBookLibrary(bookId);

  const buttonLabel = isInLibrary && library?.readingStatus
    ? READING_STATUS_LABELS[library.readingStatus]
    : isInLibrary
      ? "In your library"
      : "Add to library";

  const contextValue = useMemo<BookStatusActionContextValue>(
    () => ({
      openDialog: () => {
        if (!isLoading && library) {
          setIsOpen(true);
        }
      },
      isOpen,
      isLoading,
      buttonLabel,
      isDisabled: isLoading || !library,
    }),
    [buttonLabel, isLoading, isOpen, library],
  );

  return (
    <BookStatusActionContext.Provider value={contextValue}>
      {children}
      <BookLibraryDialog
        library={library}
        isOpen={isOpen}
        isSaving={isSaving}
        onClose={() => setIsOpen(false)}
        onSave={async (input) => {
          await saveLibrary(input);
        }}
        onRemoveFromLibrary={async () => {
          await saveLibrary({
            readingStatus: null,
            customListIds: [],
            removeFromLibrary: true,
          });
        }}
      />
    </BookStatusActionContext.Provider>
  );
}

export interface BookStatusActionTriggerProps {
  className?: string;
}

export function BookStatusActionTrigger({ className = "" }: BookStatusActionTriggerProps) {
  const { openDialog, isOpen, isLoading, buttonLabel, isDisabled } =
    useBookStatusActionContext();

  return (
    <div className={`relative mx-auto w-full max-w-sm md:mx-0 ${className}`}>
      <div className="flex">
        <button
          type="button"
          className="focus-ring inline-flex flex-1 items-center justify-center gap-2 rounded-l-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-medium text-[var(--color-surface)] disabled:opacity-60"
          onClick={openDialog}
          disabled={isDisabled}
        >
          {isLoading ? (
            <>
              <QuillSpinner size="sm" decorative />
              Loading…
            </>
          ) : (
            buttonLabel
          )}
        </button>
        <button
          type="button"
          className="focus-ring rounded-r-xl border-l border-[var(--color-surface)]/25 bg-[var(--color-accent)] px-3 py-3 text-[var(--color-surface)] disabled:opacity-60"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={openDialog}
          disabled={isDisabled}
        >
          <ChevronDownIcon className="h-4 w-4" />
          <span className="sr-only">Manage library lists</span>
        </button>
      </div>
    </div>
  );
}
