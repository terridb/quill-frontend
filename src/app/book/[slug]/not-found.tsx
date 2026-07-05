import Link from "next/link";

export default function BookNotFound() {
  return (
    <div className="flex min-h-[40vh] flex-col justify-center">
      <h1 className="text-display text-2xl text-[var(--color-ink)]">Book not found</h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--color-ink-secondary)]">
        This title is not in Open Library, or the link may be outdated. Search for
        another book to continue.
      </p>
      <Link
        href="/"
        className="focus-ring mt-6 inline-flex w-fit rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-surface)]"
      >
        Back to search
      </Link>
    </div>
  );
}
