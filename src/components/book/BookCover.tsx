import Image from "next/image";

export interface BookCoverProps {
  coverUrl: string | null;
  title: string;
  className?: string;
  priority?: boolean;
}

export function BookCover({
  coverUrl,
  title,
  className = "",
  priority = false,
}: BookCoverProps) {
  return (
    <div
      title={title}
      className={`book-cover-hover relative shrink-0 overflow-hidden rounded-md bg-[var(--color-fill)] shadow-[var(--shadow-cover)] ${className}`}
    >
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 176px, 288px"
          className="object-cover"
          quality={90}
          priority={priority}
        />
      ) : (
        <div className="flex h-full items-center justify-center px-2 text-center text-xs leading-tight text-[var(--color-muted)]">
          No cover
        </div>
      )}
    </div>
  );
}
