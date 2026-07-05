interface EditionEntry {
  number_of_pages?: number;
  languages?: { key: string }[];
  physical_format?: string;
}

const PRINT_FORMAT_PATTERN = /hardcover|paperback|print|book/i;

function isEnglishEdition(edition: EditionEntry): boolean {
  return edition.languages?.some((lang) => lang.key === "/languages/eng") ?? false;
}

function isPrintEdition(edition: EditionEntry): boolean {
  if (!edition.physical_format) {
    return true;
  }
  return PRINT_FORMAT_PATTERN.test(edition.physical_format);
}

export function pickPageCount(editions: EditionEntry[]): number | null {
  const withPages = editions.filter(
    (edition) =>
      typeof edition.number_of_pages === "number" && edition.number_of_pages > 0,
  );

  if (withPages.length === 0) {
    return null;
  }

  const englishPrint = withPages.find(
    (edition) => isEnglishEdition(edition) && isPrintEdition(edition),
  );
  if (englishPrint?.number_of_pages) {
    return englishPrint.number_of_pages;
  }

  const english = withPages.find((edition) => isEnglishEdition(edition));
  if (english?.number_of_pages) {
    return english.number_of_pages;
  }

  return withPages[0]?.number_of_pages ?? null;
}
