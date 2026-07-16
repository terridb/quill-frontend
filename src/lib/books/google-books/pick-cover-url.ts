import type { GoogleBooksVolumeInfo } from "@/src/lib/books/google-books/schemas";

type ImageLinks = NonNullable<GoogleBooksVolumeInfo["imageLinks"]>;

/** Google "publisher" covers with imgtk tokens often fail via next/image. */
function isFragileCoverUrl(url: string): boolean {
  return url.includes("imgtk=") || url.includes("/books/publisher/");
}

/**
 * Prefer stable thumbnail-sized Google covers over extraLarge/large.
 * Volume detail responses include publisher URLs with short-lived imgtk tokens
 * that break in the Next.js image optimizer; search listings only expose thumbnails.
 */
export function pickCoverUrl(imageLinks: ImageLinks | undefined): string | null {
  if (!imageLinks) {
    return null;
  }

  const candidates = [
    imageLinks.thumbnail,
    imageLinks.small,
    imageLinks.medium,
    imageLinks.smallThumbnail,
    imageLinks.large,
    imageLinks.extraLarge,
  ].filter((url): url is string => Boolean(url));

  const preferred =
    candidates.find((url) => !isFragileCoverUrl(url)) ?? candidates[0];

  if (!preferred) {
    return null;
  }

  return preferred.replace(/^http:/, "https:");
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
