import { BookPagesIcon } from "@/src/components/ui/icons";

export interface BookPageCountProps {
  numberOfPages: number | null;
  className?: string;
}

export function BookPageCount({
  numberOfPages,
  className = "",
}: BookPageCountProps) {
  if (numberOfPages === null) {
    return null;
  }

  return (
    <p
      className={`mt-4 flex items-center justify-center gap-2 text-sm text-[var(--color-ink-secondary)] md:justify-start ${className}`}
    >
      <BookPagesIcon className="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
      <span>
        {numberOfPages.toLocaleString()} {numberOfPages === 1 ? "page" : "pages"}
      </span>
    </p>
  );
}
