import { normalizeLanguageCode } from "@/src/lib/books/google-books/is-recommendable-volume";

const displayNames = new Intl.DisplayNames(["en"], { type: "language" });

export function formatBookLanguage(
  language: string | null | undefined,
): string | null {
  if (!language?.trim()) {
    return null;
  }

  const normalized = normalizeLanguageCode(language);

  try {
    const label = displayNames.of(normalized);

    if (label && label.toLowerCase() !== normalized.toLowerCase()) {
      return label;
    }
  } catch {
    // Fall through to the code when Intl cannot resolve the language.
  }

  return normalized.toUpperCase();
}
