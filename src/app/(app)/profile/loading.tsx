export default function ProfileLoading() {
  return (
    <div className="profile-page animate-pulse">
      <div className="relative flex flex-col items-center pb-8 text-center">
        <div className="absolute top-0 right-0 h-9 w-14 rounded-lg bg-[var(--color-fill)]" />
        <div className="size-28 shrink-0 rounded-full bg-[var(--color-fill)]" />
        <div className="mt-5 h-9 w-40 max-w-full rounded-md bg-[var(--color-fill)]" />
      </div>
      <div className="border-t border-[var(--color-border)]" aria-hidden="true" />
      <div className="pt-8">
        <div className="mb-5 flex items-baseline justify-between">
          <div className="h-7 w-48 rounded-md bg-[var(--color-fill)]" />
          <div className="h-4 w-16 rounded bg-[var(--color-fill)]" />
        </div>
        <div className="bookshelf" aria-hidden="true">
          <div className="flex min-h-[8.5rem] items-end justify-center gap-2 px-2 pb-1 sm:gap-3 md:min-h-[9.5rem]">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="aspect-[2/3] w-[3.5rem] shrink-0 rounded-md bg-[var(--color-fill)] sm:w-[4rem] md:w-[4.5rem]"
              />
            ))}
          </div>
          <div className="bookshelf-ledge" />
        </div>
      </div>
    </div>
  );
}
