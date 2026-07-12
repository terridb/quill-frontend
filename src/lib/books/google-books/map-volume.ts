import type {
  BookDetail,
  BookSearchResult,
  RelatedBook,
} from "@/src/types/book";
import { getVolumeLanguage } from "@/src/lib/books/google-books/is-recommendable-volume";
import { normalizeCategories } from "@/src/lib/books/google-books/normalize-categories";
import { normalizeDescription } from "@/src/lib/books/google-books/normalize-description";
import { pickCoverUrl } from "@/src/lib/books/google-books/pick-cover-url";
import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

function formatAuthors(authors: string[] | undefined): string {
  return authors?.length ? authors.join(", ") : "Unknown author";
}

export function mapVolumeToSearchResult(volume: GoogleBooksVolume): BookSearchResult {
  const { id, volumeInfo } = volume;

  return {
    bookId: id,
    title: volumeInfo.title ?? "Untitled",
    authors: formatAuthors(volumeInfo.authors),
    coverUrl: pickCoverUrl(volumeInfo.imageLinks),
    language: getVolumeLanguage(volume),
  };
}

export function mapVolumeToRelatedBook(volume: GoogleBooksVolume): RelatedBook {
  const { id, volumeInfo } = volume;

  return {
    bookId: id,
    title: volumeInfo.title ?? "Untitled",
    authors: formatAuthors(volumeInfo.authors),
    coverUrl: pickCoverUrl(volumeInfo.imageLinks),
  };
}

export function mapVolumeToBookDetail(
  volume: GoogleBooksVolume,
  relatedBooks: RelatedBook[],
  authorBooks: RelatedBook[] = [],
): BookDetail {
  const { id, volumeInfo } = volume;
  const { genreLabels, subjectTags } = normalizeCategories(
    volumeInfo.categories,
    volumeInfo.mainCategory,
  );
  const pageCount = volumeInfo.pageCount;

  return {
    bookId: id,
    title: volumeInfo.title ?? "Untitled",
    authors: formatAuthors(volumeInfo.authors),
    description: normalizeDescription(volumeInfo.description),
    genreLabels,
    subjectTags,
    coverUrl: pickCoverUrl(volumeInfo.imageLinks),
    numberOfPages:
      typeof pageCount === "number" && pageCount > 0 ? pageCount : null,
    language: getVolumeLanguage(volume),
    relatedBooks,
    authorBooks,
  };
}
