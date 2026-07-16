"use client";

import { BookCover } from "@/src/components/book/BookCover";
import { ApprovalCoverStack } from "@/src/components/ai-chat/ApprovalCoverStack";
import type { ChatBookMention } from "@/src/components/ai-chat/ChatMessageText";

export interface ToolApprovalCardProps {
  title: string;
  description: string;
  books?: ChatBookMention[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function ToolApprovalCard({
  title,
  description,
  books = [],
  onConfirm,
  onCancel,
}: ToolApprovalCardProps) {
  const isStack = books.length > 1;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-fill)]/60 px-3.5 py-3">
      <p className="text-sm font-medium text-[var(--color-ink)]">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-secondary)]">
        {description}
      </p>

      {isStack ? <ApprovalCoverStack books={books} /> : null}

      {!isStack && books.length === 1 ? (
        <div className="mt-3 flex min-w-0 items-center gap-2.5">
          <BookCover
            coverUrl={books[0]!.coverUrl}
            title={books[0]!.title}
            className="h-14 w-10 shrink-0 !rounded-sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--color-ink)]">
              {books[0]!.title}
            </p>
            <p className="truncate text-xs text-[var(--color-muted)]">
              {books[0]!.authors}
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="focus-ring rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="focus-ring rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-ink-secondary)] transition-colors hover:bg-[var(--color-fill)]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
