export function normalizeDescription(
  description: string | { value: string } | undefined,
): string | null {
  if (!description) {
    return null;
  }

  const text = typeof description === "string" ? description : description.value;
  const trimmed = text.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed
    .replace(/\[\*\*[^*]+\*\*\]\([^)]+\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
