import { normalizeCategories } from "@/src/lib/books/google-books/normalize-categories";
import { normalizeDescription } from "@/src/lib/books/google-books/normalize-description";
import {
  pickCoverUrl,
  pickIsbn13,
} from "@/src/lib/books/google-books/pick-cover-url";
import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";
import type { TablesInsert } from "@/src/types/database";

function formatAuthors(authors: string[] | undefined): string | null {
  return authors?.length ? authors.join(", ") : null;
}

function parsePublishedDate(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return `${trimmed}-01`;
  }

  if (/^\d{4}$/.test(trimmed)) {
    return `${trimmed}-01-01`;
  }

  return null;
}

export function mapVolumeToBookRow(volume: GoogleBooksVolume): TablesInsert<"books"> {
  const { id, volumeInfo } = volume;
  const { genreLabels, subjectTags } = normalizeCategories(
    volumeInfo.categories,
    volumeInfo.mainCategory,
  );
  const pageCount = volumeInfo.pageCount;

  return {
    api_id: id,
    title: volumeInfo.title ?? "Untitled",
    author: formatAuthors(volumeInfo.authors),
    cover_url: pickCoverUrl(volumeInfo.imageLinks),
    description: normalizeDescription(volumeInfo.description),
    genres: genreLabels.length > 0 ? genreLabels : null,
    tags: subjectTags.length > 0 ? subjectTags : null,
    page_count:
      typeof pageCount === "number" && pageCount > 0 ? pageCount : null,
    published_date: parsePublishedDate(volumeInfo.publishedDate),
    isbn: pickIsbn13(volumeInfo.industryIdentifiers),
  };
}
