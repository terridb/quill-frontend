export function normalizeDescription(description: string | undefined): string | null {
  if (!description) {
    return null;
  }

  const trimmed = description.trim();
  if (!trimmed) {
    return null;
  }

  const withoutHtml = trimmed.replace(/<[^>]+>/g, "");
  const normalized = withoutHtml.replace(/\s{2,}/g, " ").trim();

  return normalized || null;
}
