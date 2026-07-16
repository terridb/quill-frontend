"use client";

import Link from "next/link";
import { getBookPath } from "@/src/lib/books/book-path";
import { BookCover } from "@/src/components/book/BookCover";

export interface BookMentionCardProps {
  apiId: string;
  title: string;
  authors: string;
  coverUrl?: string | null;
}

export function BookMentionCard({
  apiId,
  title,
  authors,
  coverUrl = null,
}: BookMentionCardProps) {
  return (
    <Link
      href={getBookPath(apiId, title)}
      className="focus-ring ai-book-mention flex min-w-0 max-w-full items-center gap-3 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 transition-colors hover:border-[color-mix(in_srgb,var(--color-accent)_35%,var(--color-border))]"
    >
      <BookCover
        coverUrl={coverUrl}
        title={title}
        className="h-14 w-10 shrink-0 !rounded-sm"
      />
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium text-[var(--color-ink)]">
          {title}
        </p>
        <p className="truncate text-xs text-[var(--color-muted)]">{authors}</p>
      </div>
    </Link>
  );
}
