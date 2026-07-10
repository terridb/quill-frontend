"use client";

import { useRef } from "react";
import { useShelfLayout } from "@/src/hooks/use-shelf-layout";

const SKELETON_BOOK_COUNT = 8;

export function BookshelfSkeleton() {
  const rowRef = useRef<HTMLDivElement>(null);
  const { visibleCount, spineWidth, gap, overflowCount, minHeight } = useShelfLayout(
    SKELETON_BOOK_COUNT,
    rowRef,
  );
  const slotCount = overflowCount > 0 ? visibleCount + 1 : visibleCount;

  return (
    <div className="bookshelf" aria-hidden="true">
      <div
        ref={rowRef}
        className="flex w-full items-end justify-start pb-0.5"
        style={{ gap, minHeight }}
      >
        {Array.from({ length: visibleCount }, (_, index) => (
          <div
            key={index}
            className="aspect-[2/3] shrink-0 animate-pulse rounded-md bg-[var(--color-fill)]"
            style={{ width: spineWidth }}
          />
        ))}
        {overflowCount > 0 ? (
          <div
            className="aspect-[2/3] shrink-0 animate-pulse rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-fill)]"
            style={{ width: spineWidth }}
          />
        ) : null}
      </div>
      {slotCount > 0 ? <div className="bookshelf-ledge" /> : null}
    </div>
  );
}
