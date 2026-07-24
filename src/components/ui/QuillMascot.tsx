import Image from "next/image";

export type QuillMascotMood = "happy" | "question" | "oops";

export interface QuillMascotProps {
  mood: QuillMascotMood;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Accessible name when the mascot is not purely decorative. */
  label?: string;
}

const MOODS: QuillMascotMood[] = ["happy", "question", "oops"];

const MOOD_SRC: Record<QuillMascotMood, string> = {
  happy: "/mascot/quill-happy.png",
  question: "/mascot/quill-question.png",
  oops: "/mascot/quill-oops.png",
};

const SIZE_PX = {
  sm: 88,
  md: 128,
  lg: 152,
  xl: 200,
} as const;

const SIZE_CLASS = {
  sm: "h-[88px] w-[88px]",
  md: "h-32 w-32",
  lg: "h-[152px] w-[152px]",
  xl: "h-[200px] w-[200px]",
} as const;

export function QuillMascot({
  mood,
  size = "md",
  className = "",
  label,
}: QuillMascotProps) {
  const px = SIZE_PX[size];
  const decorative = !label;

  return (
    <span
      className={`quill-mascot relative inline-flex shrink-0 ${SIZE_CLASS[size]} ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
    >
      {MOODS.map((m) => (
        <Image
          key={m}
          src={MOOD_SRC[m]}
          alt=""
          width={px}
          height={px}
          className={`quill-mascot-art absolute inset-0 h-full w-full object-contain transition-opacity duration-200 ease-out ${
            m === mood ? "opacity-100" : "opacity-0"
          }`}
          sizes={`${px}px`}
          priority={m === "happy"}
        />
      ))}
    </span>
  );
}
