export default function ListDetailLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-4 w-20 rounded bg-[var(--color-fill)]" />
      <div className="mb-8 flex gap-3">
        <div className="size-4 rounded bg-[var(--color-fill)]" />
        <div>
          <div className="h-9 w-56 rounded-md bg-[var(--color-fill)]" />
          <div className="mt-2 h-4 w-16 rounded bg-[var(--color-fill)]" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index}>
            <div className="mb-2 aspect-[2/3] rounded-md bg-[var(--color-fill)]" />
            <div className="h-4 rounded bg-[var(--color-fill)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
