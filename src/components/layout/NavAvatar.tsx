export interface NavAvatarProps {
  avatarUrl: string;
  label: string;
  size?: "sm" | "md" | "lg";
}

function getInitials(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) {
    return "?";
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }

  return trimmed.slice(0, 2).toUpperCase();
}

export function NavAvatar({
  avatarUrl,
  label,
  size = "md",
}: NavAvatarProps) {
  const dimension = size === "sm" ? 36 : size === "lg" ? 112 : 40;
  const sizeClass =
    size === "sm" ? "size-9" : size === "lg" ? "size-28" : "size-10";
  const initialsClass =
    size === "sm" ? "h-9 w-9 text-xs" : size === "lg" ? "h-28 w-28 text-2xl" : "h-10 w-10 text-sm";

  if (avatarUrl) {
    return (
      // Native img avoids Next.js image optimizer issues with Supabase Storage URLs.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        width={dimension}
        height={dimension}
        className={`shrink-0 rounded-full object-cover ${sizeClass}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center rounded-full bg-[var(--color-accent-soft)] font-medium text-[var(--color-accent)] ${initialsClass}`}
    >
      {getInitials(label)}
    </span>
  );
}
