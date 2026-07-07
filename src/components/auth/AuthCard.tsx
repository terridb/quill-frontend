export interface AuthCardProps {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}

export function AuthCard({ eyebrow, title, children }: AuthCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-8 shadow-[var(--shadow-sm)] md:px-8">
      <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-[var(--color-muted)] uppercase">
        {eyebrow}
      </p>
      <h1 className="text-display mt-2 text-[1.75rem] leading-tight tracking-tight text-[var(--color-ink)]">
        {title}
      </h1>
      <div className="mt-7">{children}</div>
    </div>
  );
}
