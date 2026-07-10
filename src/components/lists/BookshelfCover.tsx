import Image from "next/image";
import Link from "next/link";
import type { ShelfPose } from "@/src/components/lists/bookshelf-poses";
import { getBookPath } from "@/src/lib/books/book-path";

export interface BookshelfCoverProps {
  bookId: string;
  title: string;
  coverUrl: string | null;
  pose: ShelfPose;
}

export function BookshelfCover({
  bookId,
  title,
  coverUrl,
  pose,
}: BookshelfCoverProps) {
  return (
    <Link
      href={getBookPath(bookId, title)}
      className="focus-ring block w-[3.5rem] shrink-0 motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 sm:w-[4rem] md:w-[4.5rem]"
      style={{
        transform: `rotate(${pose.rotate}deg) scale(${pose.scale}) translateY(${pose.y}px)`,
        transformOrigin: "bottom center",
      }}
      title={title}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-[var(--color-fill)] shadow-[var(--shadow-cover)]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 56px, 72px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-1 text-center text-[9px] leading-tight text-[var(--color-muted)]">
            No cover
          </div>
        )}
        <span className="sr-only">{title}</span>
      </div>
    </Link>
  );
}
