import { GlobeIcon } from "@/src/components/ui/icons";
import { formatBookLanguage } from "@/src/lib/books/format-book-language";

export interface BookLanguageProps {
  language: string | null;
  className?: string;
}

export function BookLanguage({ language, className = "" }: BookLanguageProps) {
  const label = formatBookLanguage(language);

  if (!label) {
    return null;
  }

  return (
    <p
      className={`mt-1.5 flex items-center justify-center gap-2 text-sm text-[var(--color-ink-secondary)] md:justify-start ${className}`}
    >
      <GlobeIcon className="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
      <span>{label}</span>
    </p>
  );
}
