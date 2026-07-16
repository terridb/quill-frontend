import Link from "next/link";

export function RecommendPromo() {
  return (
    <section
      aria-labelledby="recommend-promo-heading"
      className="recommend-promo mt-10 border-t border-[var(--color-border)] pt-8"
    >
      <div className="recommend-promo-inner relative pl-4 md:pl-5">
        <span
          aria-hidden="true"
          className="recommend-promo-rule absolute top-1 bottom-1 left-0 w-px bg-[var(--color-ink)]/25"
        />
        <p className="text-label tracking-[0.08em] uppercase">Shelf note</p>
        <h2
          id="recommend-promo-heading"
          className="text-display mt-2 max-w-sm text-[1.75rem] leading-[1.15] tracking-tight text-[var(--color-ink)] md:text-[2rem]"
        >
          Ask Quill
        </h2>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--color-ink-secondary)]">
          Get picks from your shelves and new finds.
        </p>
        <Link
          href="/ai-chat"
          className="focus-ring mt-5 inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Ask Quill
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
