export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      <div className="reading-tracker-widget max-w-[24rem]">
        <div className="reading-tracker-widget__header">
          <div className="h-7 w-[4.5rem] rounded-full bg-[var(--color-fill)]" />
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
          <div className="h-10 rounded-[0.5625rem] bg-[var(--color-fill)]" />
          <div className="aspect-[2/3] w-[5.25rem] rounded-md bg-[var(--color-fill)]" />
        </div>
      </div>
    </div>
  );
}
