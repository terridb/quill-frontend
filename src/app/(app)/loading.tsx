export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      <div className="reading-tracker-widget">
        <div className="reading-tracker-widget__header">
          <div className="h-7 w-[4.5rem] rounded-xl bg-[var(--color-fill)]" />
          <div className="flex flex-1 justify-between gap-1 px-1">
            {Array.from({ length: 7 }, (_, index) => (
              <div key={index} className="flex flex-col items-center gap-1.5">
                <div className="h-2 w-2 rounded-sm bg-[var(--color-fill)]" />
                <div className="size-1.5 rounded-full bg-[var(--color-fill)]" />
              </div>
            ))}
          </div>
        </div>
        <div className="reading-tracker-widget__body">
          <div className="aspect-[2/3] w-full rounded-md bg-[var(--color-fill)]" />
          <div className="flex flex-col justify-center gap-3">
            <div className="space-y-2">
              <div className="h-6 w-3/4 rounded-md bg-[var(--color-fill)]" />
              <div className="h-4 w-1/2 rounded-md bg-[var(--color-fill)]" />
            </div>
            <div className="h-10 w-36 rounded-2xl bg-[var(--color-fill)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
