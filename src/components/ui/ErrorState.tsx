export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Could not load results",
  message = "Check your connection and try again.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-6 shadow-[var(--shadow-sm)] ${className}`}
      role="alert"
    >
      <p className="text-display text-lg text-[var(--color-ink)]">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">
        {message}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="focus-ring mt-4 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-surface)]"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
