import Image from "next/image";

export interface NavAvatarProps {
  avatarUrl: string;
  label: string;
  size?: "sm" | "md";
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
  const dimension = size === "sm" ? 36 : 40;

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={dimension}
        height={dimension}
        className="rounded-full object-cover"
        unoptimized
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center rounded-full bg-[var(--color-accent-soft)] font-medium text-[var(--color-accent)] ${
        size === "sm" ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm"
      }`}
    >
      {getInitials(label)}
    </span>
  );
}
