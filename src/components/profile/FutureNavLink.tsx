export interface FutureNavLinkProps {
  label: string;
  disabled?: boolean;
  className?: string;
}

export function FutureNavLink({
  label,
  disabled = true,
  className = "",
}: FutureNavLinkProps) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        title="Coming soon"
        className={`cursor-not-allowed text-sm text-[var(--color-muted)] ${className}`}
      >
        {label}
      </span>
    );
  }

  return null;
}
