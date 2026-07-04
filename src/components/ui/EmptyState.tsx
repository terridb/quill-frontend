import { BookOpenIcon } from "@/src/components/ui/icons";

export interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  title,
  description,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center px-4 py-16 text-center ${className}`}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-fill)] text-[var(--color-muted)]">
        <BookOpenIcon className="h-5 w-5" />
      </div>
      <p className="text-display max-w-xs text-lg leading-snug text-[var(--color-ink)]">
        {title}
      </p>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--color-muted)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
