import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

export function isUserFacingBook(volume: GoogleBooksVolume): boolean {
  const { printType, industryIdentifiers } = volume.volumeInfo;

  if (printType !== "BOOK") {
    return false;
  }

  return (
    industryIdentifiers?.some((id) => id.type.includes("ISBN")) ?? false
  );
}
