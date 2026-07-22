import Image from "next/image";

export interface QuillSpinnerProps {
  className?: string;
  /** `sm` for buttons/inline (16px); `md` for standalone waits (32px). */
  size?: "sm" | "md";
  /** Accessible name when not decorative; defaults to "Loading". */
  label?: string;
  /** Hide from assistive tech when adjacent text already says loading. */
  decorative?: boolean;
}

const SIZE_PX = {
  sm: 16,
  md: 32,
} as const;

const SIZE_CLASS = {
  sm: "size-4",
  md: "size-8",
} as const;

/** Compact spinning otter for fetch/load waits — not a mascot mood swap. */
export function QuillSpinner({
  className = "",
  size = "md",
  label = "Loading",
  decorative = false,
}: QuillSpinnerProps) {
  const px = SIZE_PX[size];

  return (
    <span
      className={`inline-flex shrink-0 ${SIZE_CLASS[size]} ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
    >
      <Image
        src="/mascot/quill-spinner.png"
        alt=""
        width={px}
        height={px}
        className="quill-mascot-art quill-spinner-spin h-full w-full object-contain"
        sizes={`${px}px`}
      />
    </span>
  );
}
