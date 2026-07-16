"use client";

import { useEffect, useRef, useState } from "react";
import { BookCover } from "@/src/components/book/BookCover";
import type { ChatBookMention } from "@/src/components/ai-chat/ChatMessageText";

/** Cover footprint in the stack (must match Tailwind w/h below). */
const COVER_W = 40;
const COVER_H = 56;
/** How much of each cover stays visible past the one on top of it. */
const STEP = 18;
const OVERFLOW_CHIP_W = 40;
const STACK_GAP = 4;

function maxVisibleCovers(containerWidth: number, total: number): number {
  if (total <= 1 || containerWidth <= 0) {
    return total;
  }

  // All covers fit without a chip.
  let widthForAll = COVER_W + (total - 1) * STEP;
  if (widthForAll <= containerWidth) {
    return total;
  }

  // Reserve space for the +N chip after the last visible cover.
  const budget = containerWidth - OVERFLOW_CHIP_W - STACK_GAP;
  if (budget < COVER_W) {
    return 1;
  }

  const visible = 1 + Math.floor((budget - COVER_W) / STEP);
  return Math.max(1, Math.min(total - 1, visible));
}

export function ApprovalCoverStack({ books }: { books: ChatBookMention[] }) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(books.length);

  useEffect(() => {
    const node = measureRef.current;
    if (!node) {
      return;
    }

    const update = () => {
      setVisibleCount(maxVisibleCovers(node.clientWidth, books.length));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [books.length]);

  if (books.length === 0) {
    return null;
  }

  const visible = books.slice(0, visibleCount);
  const overflow = books.length - visible.length;
  const stackWidth =
    COVER_W +
    Math.max(0, visible.length - 1) * STEP +
    (overflow > 0 ? STACK_GAP + OVERFLOW_CHIP_W : 0);

  const label = books.map((book) => book.title).join(", ");

  return (
    <div
      ref={measureRef}
      className="approval-cover-stack mt-3 w-full"
      role="img"
      aria-label={label}
    >
      <ul
        className="relative list-none"
        style={{ height: COVER_H, width: stackWidth }}
      >
        {visible.map((book, index) => (
          <li
            key={book.apiId}
            className="approval-cover-stack__item absolute top-0"
            style={{
              left: index * STEP,
              zIndex: index + 1,
              width: COVER_W,
              height: COVER_H,
            }}
          >
            <BookCover
              coverUrl={book.coverUrl}
              title={book.title}
              className="h-full w-full !rounded-[3px] ring-1 ring-[var(--color-surface)]"
            />
          </li>
        ))}

        {overflow > 0 ? (
          <li
            className="absolute top-0 flex items-center justify-center rounded-[3px] bg-[var(--color-accent)] text-[0.6875rem] font-semibold tracking-wide text-white ring-1 ring-[var(--color-surface)]"
            style={{
              left: visible.length * STEP + STACK_GAP,
              zIndex: visible.length + 1,
              width: OVERFLOW_CHIP_W,
              height: COVER_H,
            }}
            aria-hidden="true"
          >
            +{overflow}
          </li>
        ) : null}
      </ul>

      <p className="sr-only">
        {books.length} books: {label}
      </p>
    </div>
  );
}
