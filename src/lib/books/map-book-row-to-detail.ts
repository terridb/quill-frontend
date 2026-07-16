import type { BookDetail } from "@/src/types/book";
import type { Tables } from "@/src/types/database";

export function mapBookRowToBookDetail(
  row: Tables<"books">,
  relatedBooks: BookDetail["relatedBooks"],
  authorBooks: BookDetail["authorBooks"],
): BookDetail {
  return {
    bookId: row.api_id,
    title: row.title,
    authors: row.author ?? "Unknown author",
    description: row.description,
    genreLabels: row.genres ?? [],
    subjectTags: row.tags ?? [],
    coverUrl: row.cover_url,
    numberOfPages:
      typeof row.page_count === "number" && row.page_count > 0
        ? row.page_count
        : null,
    language: row.language,
    relatedBooks,
    authorBooks,
  };
}
