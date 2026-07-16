"use client";

export interface ToolApprovalCardProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ToolApprovalCard({
  title,
  description,
  onConfirm,
  onCancel,
}: ToolApprovalCardProps) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-fill)]/60 px-3.5 py-3">
      <p className="text-sm font-medium text-[var(--color-ink)]">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-secondary)]">
        {description}
      </p>
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
