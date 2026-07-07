import { LoadingState } from "@/src/components/ui/LoadingState";

export default function BookLoading() {
  return (
    <div
      className="book-detail-page md:-mx-8 md:grid md:grid-cols-[16rem_minmax(0,1fr)] lg:grid-cols-[18rem_minmax(0,1fr)]"
      aria-busy="true"
      aria-label="Loading book"
    >
      <aside className="book-detail-sidebar flex flex-col items-center md:items-stretch md:justify-start md:border-r md:border-[var(--color-border)] md:px-6 md:py-10 lg:px-8">
        <div className="aspect-[2/3] w-[11rem] shrink-0 rounded-md bg-[var(--color-fill)] md:w-full" />
        <div className="mt-5 hidden h-11 w-full shrink-0 rounded-xl bg-[var(--color-fill)] md:block" />
      </aside>
      <div className="mt-5 flex w-full flex-col items-center space-y-3 md:mt-0 md:items-start md:px-8 md:py-10">
        <div className="h-8 w-4/5 max-w-md rounded-md bg-[var(--color-fill)]" />
        <div className="h-4 w-1/2 max-w-xs rounded-md bg-[var(--color-fill)]" />
        <div className="flex gap-2 pt-1">
          <div className="h-6 w-16 rounded-full bg-[var(--color-fill)]" />
          <div className="h-6 w-20 rounded-full bg-[var(--color-fill)]" />
        </div>
        <div className="h-11 w-full max-w-sm rounded-xl bg-[var(--color-fill)] md:hidden" />
        <div className="h-4 w-24 rounded-md bg-[var(--color-fill)]" />
        <div className="mt-5 w-full space-y-3 border-t border-[var(--color-border)] pt-8">
          <LoadingState variant="skeleton" rowCount={3} />
        </div>
        <div className="book-section-rule w-full space-y-3">
          <div className="h-6 w-32 rounded-md bg-[var(--color-fill)]" />
          <LoadingState variant="skeleton" rowCount={2} />
        </div>
      </div>
    </div>
  );
}
