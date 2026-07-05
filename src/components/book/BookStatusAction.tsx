"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon } from "@/src/components/ui/icons";
import { useBookStatus } from "@/src/hooks/use-book-status";
import {
  READING_STATUS_LABELS,
  type ReadingStatus,
} from "@/src/types/open-library";

const STATUS_OPTIONS: ReadingStatus[] = [
  "want_to_read",
  "currently_reading",
  "finished",
  "did_not_finish",
];

export interface BookStatusActionProps {
  openLibraryId: string;
  className?: string;
}

export function BookStatusAction({
  openLibraryId,
  className = "",
}: BookStatusActionProps) {
  const { status, setStatus } = useBookStatus(openLibraryId);
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const onPointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [isOpen]);

  const selectStatus = (next: ReadingStatus) => {
    setStatus(next);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto mt-5 w-full max-w-sm md:mx-0 ${className}`}
    >
      <div className="flex">
        <button
          type="button"
          className="focus-ring flex-1 rounded-l-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-medium text-[var(--color-surface)]"
          onClick={() => selectStatus(status)}
        >
          {READING_STATUS_LABELS[status]}
        </button>
        <button
          type="button"
          className="focus-ring rounded-r-xl border-l border-[var(--color-surface)]/25 bg-[var(--color-accent)] px-3 py-3 text-[var(--color-surface)]"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls={menuId}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <ChevronDownIcon className="h-4 w-4" />
          <span className="sr-only">Change reading status</span>
        </button>
      </div>
      {isOpen ? (
        <ul
          id={menuId}
          role="menu"
          className="absolute top-full right-0 left-0 z-10 mt-2 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-[var(--shadow-md)]"
        >
          {STATUS_OPTIONS.map((option) => (
            <li key={option} role="none">
              <button
                type="button"
                role="menuitem"
                className={`focus-ring w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--color-accent-soft)] ${
                  option === status
                    ? "font-medium text-[var(--color-accent)]"
                    : "text-[var(--color-ink)]"
                }`}
                onClick={() => selectStatus(option)}
              >
                {READING_STATUS_LABELS[option]}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
