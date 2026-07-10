import { GlobeIcon, LockIcon } from "@/src/components/ui/icons";

export interface ListPrivacyIconProps {
  isPrivate: boolean;
  className?: string;
}

export function ListPrivacyIcon({ isPrivate, className = "" }: ListPrivacyIconProps) {
  const label = isPrivate ? "Private list" : "Public list";

  return (
    <span
      className={`inline-flex shrink-0 text-[var(--color-muted)] ${className}`}
      title={label}
      aria-label={label}
    >
      {isPrivate ? (
        <LockIcon className="size-4" />
      ) : (
        <GlobeIcon className="size-4" />
      )}
    </span>
  );
}
