import { QuillSpinner } from "@/src/components/ui/QuillSpinner";

export interface LoadingStateProps {
  variant?: "spinner" | "skeleton";
  rowCount?: number;
  className?: string;
}

export function LoadingState({
  variant = "spinner",
  rowCount = 3,
  className = "",
}: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className={`divide-y divide-[var(--color-border)] ${className}`} aria-busy="true" aria-live="polite">
        {Array.from({ length: rowCount }, (_, index) => (
          <div key={index} className="flex gap-4 py-4">
            <div className="h-[5.25rem] w-[3.25rem] shrink-0 animate-pulse rounded-md bg-[var(--color-fill)]" />
            <div className="flex flex-1 flex-col justify-center gap-2.5">
              <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--color-fill)]" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--color-fill)]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center py-8 ${className}`}
      aria-busy="true"
      aria-live="polite"
    >
      <QuillSpinner />
    </div>
  );
}
