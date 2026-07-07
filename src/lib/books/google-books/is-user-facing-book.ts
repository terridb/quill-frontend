import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

/** Volume from a search listing — metadata is often sparse (no ISBN, no printType). */
export function isListedBookVolume(volume: GoogleBooksVolume): boolean {
  const { printType } = volume.volumeInfo;

  if (printType && printType !== "BOOK") {
    return false;
  }

  return Boolean(volume.volumeInfo.title?.trim());
}

export function isUserFacingBook(volume: GoogleBooksVolume): boolean {
  const { printType, industryIdentifiers } = volume.volumeInfo;

  if (printType !== "BOOK") {
    return false;
  }

  return (
    industryIdentifiers?.some((id) => id.type.includes("ISBN")) ?? false
  );
}
