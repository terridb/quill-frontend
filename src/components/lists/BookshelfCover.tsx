import Image from "next/image";
import Link from "next/link";
import { shelfSpineStyle, type ShelfPose } from "@/src/components/lists/bookshelf-poses";
import { getBookPath } from "@/src/lib/books/book-path";

export interface BookshelfCoverProps {
  bookId: string;
  title: string;
  coverUrl: string | null;
  pose: ShelfPose;
  spineWidth: number;
}

export function BookshelfCover({
  bookId,
  title,
  coverUrl,
  pose,
  spineWidth,
}: BookshelfCoverProps) {
  const spineWidthPx = Math.round(spineWidth);

  return (
    <Link
      href={getBookPath(bookId, title)}
      className="bookshelf-spine focus-ring block shrink-0"
      style={{
        ...shelfSpineStyle(pose),
        width: spineWidth,
      }}
      title={title}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-[var(--color-fill)] shadow-[var(--shadow-cover)]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            sizes={`${spineWidthPx}px`}
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
