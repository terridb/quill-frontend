import type { ShelfPose } from "@/src/components/profile/bookshelf-poses";

export interface BookshelfOverflowProps {
  count: number;
  pose: ShelfPose;
}

export function BookshelfOverflow({ count, pose }: BookshelfOverflowProps) {
  return (
    <div
      aria-hidden="true"
      className="flex w-[3.5rem] shrink-0 items-end sm:w-[4rem] md:w-[4.5rem]"
      style={{
        transform: `rotate(${pose.rotate}deg) scale(${pose.scale}) translateY(${pose.y}px)`,
        transformOrigin: "bottom center",
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
