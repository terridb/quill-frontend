const DEFAULT_MAX = 400;

export function truncateText(
  value: string | null | undefined,
  max = DEFAULT_MAX,
): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }

  return `${trimmed.slice(0, max - 1)}…`;
}
