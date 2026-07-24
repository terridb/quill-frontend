export interface ListsSectionHeadingProps {
  id: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

/** Chapter marker for list groups — sits above individual shelf titles. */
export function ListsSectionHeading({
  id,
  children,
  action,
}: ListsSectionHeadingProps) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
      <div className="min-w-0">
        <h2
          id={id}
          className="text-display text-[1.4rem] leading-tight tracking-tight text-[var(--color-ink)] md:text-[1.85rem]"
        >
          {children}
        </h2>
        <div
          className="mt-3 h-0.5 w-11 rounded-full bg-[var(--color-accent)]"
          aria-hidden="true"
        />
      </div>
      {action ? <div className="shrink-0 pb-0.5">{action}</div> : null}
    </div>
  );
}
