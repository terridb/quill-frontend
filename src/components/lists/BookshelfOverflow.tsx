import { shelfSpineStyle, type ShelfPose } from "@/src/components/lists/bookshelf-poses";

export interface BookshelfOverflowProps {
  count: number;
  pose: ShelfPose;
  spineWidth: number;
}

export function BookshelfOverflow({ count, pose, spineWidth }: BookshelfOverflowProps) {
  return (
    <div
      aria-hidden="true"
      className="bookshelf-spine flex shrink-0 items-end"
      style={{
        ...shelfSpineStyle(pose),
        width: spineWidth,
      }}
    >
      <div className="flex aspect-[2/3] w-full items-center justify-center rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-accent-soft)] shadow-[var(--shadow-cover)]">
        <span className="text-display text-sm font-medium text-[var(--color-accent)]">
          +{count}
        </span>
      </div>
      <span className="sr-only">{count} more books</span>
    </div>
  );
}
