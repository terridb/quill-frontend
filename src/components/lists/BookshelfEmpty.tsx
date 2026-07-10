import { getListEmptyCopy } from "@/src/lib/lists/list-empty-copy";

const GHOST_SPINE_COUNT = 3;

export interface BookshelfEmptyProps {
  listName?: string;
}

export function BookshelfEmpty({ listName }: BookshelfEmptyProps) {
  const { heading, hint } = getListEmptyCopy(listName);

  return (
    <div className="bookshelf">
      <div className="flex min-h-[8.25rem] flex-col items-center justify-end px-0 pb-0.5 sm:min-h-[9.5rem] md:min-h-[11rem]">
        <div
          className="flex w-full items-end justify-center gap-2.5 sm:gap-3 md:gap-3.5"
          aria-hidden="true"
        >
          {Array.from({ length: GHOST_SPINE_COUNT }, (_, index) => (
            <div
              key={index}
              className="aspect-[2/3] w-[3.5rem] shrink-0 rounded-md border border-dashed border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-fill)_70%,transparent)] sm:w-[4.25rem] md:w-[5rem]"
            />
          ))}
        </div>
        <div className="w-full pt-5 text-center md:max-w-md md:pt-6 md:text-left">
          <p className="text-display text-sm tracking-tight text-[var(--color-ink-secondary)] md:text-[0.95rem]">
            {heading}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">{hint}</p>
        </div>
      </div>
      <div className="bookshelf-ledge" aria-hidden="true" />
    </div>
  );
}
