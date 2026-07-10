export default function ListsLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-10 h-9 w-40 rounded-md bg-[var(--color-fill)] md:mb-12" />
      <div className="mb-8 h-7 w-52 rounded-md bg-[var(--color-fill)]" />
      {Array.from({ length: 2 }, (_, sectionIndex) => (
        <div key={sectionIndex} className="mb-10">
          <div className="mb-6 flex justify-between">
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
      ))}
    </div>
  );
}
