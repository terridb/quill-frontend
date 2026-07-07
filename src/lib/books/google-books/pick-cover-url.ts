import type { GoogleBooksVolumeInfo } from "@/src/lib/books/google-books/schemas";

type ImageLinks = NonNullable<GoogleBooksVolumeInfo["imageLinks"]>;

export function pickCoverUrl(imageLinks: ImageLinks | undefined): string | null {
  if (!imageLinks) {
    return null;
  }

  const url =
    imageLinks.extraLarge ??
    imageLinks.large ??
    imageLinks.medium ??
    imageLinks.thumbnail ??
    imageLinks.smallThumbnail ??
    imageLinks.small;

  if (!url) {
    return null;
  }

  return url.replace(/^http:/, "https:");
}

export function pickIsbn13(
  identifiers: GoogleBooksVolumeInfo["industryIdentifiers"],
): string | null {
  if (!identifiers?.length) {
    return null;
  }

  const isbn13 = identifiers.find((entry) => entry.type === "ISBN_13");
  return isbn13?.identifier ?? null;
}
