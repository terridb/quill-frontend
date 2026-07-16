import { BookOpenIcon } from "@/src/components/ui/icons";
import { getListEmptyCopy } from "@/src/lib/lists/list-empty-copy";

export interface ListBooksEmptyProps {
  listName: string;
}

export function ListBooksEmpty({ listName }: ListBooksEmptyProps) {
  const { heading, hint } = getListEmptyCopy(listName);

  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,var(--color-fill))] px-6 py-10 text-center md:px-10 md:py-12">
      <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full bg-[var(--color-fill)] text-[var(--color-muted)]">
        <BookOpenIcon className="size-5" />
      </div>
      <p className="text-display text-lg tracking-tight text-[var(--color-ink)]">{heading}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--color-muted)]">
        {hint}
      </p>
    </div>
  );
}
