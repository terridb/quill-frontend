"use client";

import { useEffect } from "react";
import { BookSearchResultsList } from "@/src/components/search/BookSearchResultsList";
import { isOutsideElement } from "@/src/lib/dom/safe-event-target";
import { useSearch } from "@/src/providers/search-provider";

export interface BookSearchPanelProps {
  panelId: string;
  isOpen: boolean;
  onClose: () => void;
  containerRef: React.RefObject<HTMLElement | null>;
}

export function BookSearchPanel({
  panelId,
  isOpen,
  onClose,
  containerRef,
}: BookSearchPanelProps) {
  const { query } = useSearch();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && isOutsideElement(containerRef.current, event)) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [containerRef, isOpen, onClose]);

  useEffect(() => {
    if (query.length < 2) {
      onClose();
    }
  }, [onClose, query.length]);

  if (!isOpen || query.length < 2) {
    return null;
  }

  return (
    <div
      id={panelId}
      className="absolute top-full right-0 left-0 z-50 mt-2 max-h-[min(70vh,32rem)] overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-lg)]"
      role="region"
      aria-label="Search results"
    >
      <BookSearchResultsList />
    </div>
  );
}
