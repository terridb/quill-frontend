export default function Home() {
  return (
    <div className="flex min-h-[55vh] flex-col justify-center">
      <h1 className="text-display max-w-sm text-[2rem] leading-[1.12] tracking-tight text-[var(--color-ink)] md:text-[2.35rem]">
        Every book you read, in one place.
      </h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--color-ink-secondary)]">
        Find titles and authors, then track what you read.
      </p>
      <p className="text-label mt-8 md:hidden">
        Tap the search icon below to get started
      </p>
      <p className="text-label mt-8 hidden md:block">
        Use the search bar above to get started
      </p>
    </div>
  );
}
