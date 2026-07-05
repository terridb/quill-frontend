import type { RelatedBook } from "@/src/types/open-library";
import { SimilarBookCard } from "@/src/components/book/SimilarBookCard";

export interface SimilarBooksProps {
  books: RelatedBook[];
}

export function SimilarBooks({ books }: SimilarBooksProps) {
  if (books.length === 0) {
    return null;
  }

  return (
    <section className="book-section-rule" aria-labelledby="similar-books-heading">
      <h2
        id="similar-books-heading"
        className="text-display text-lg text-[var(--color-ink)]"
      >
        More like this
      </h2>
      <div className="similar-books-scroll mt-5 md:hidden">
        {books.map((book) => (
          <SimilarBookCard key={book.openLibraryId} book={book} />
        ))}
      </div>
      <div className="mt-5 hidden gap-5 md:grid md:grid-cols-3 lg:grid-cols-4">
        {books.map((book) => (
          <SimilarBookCard key={book.openLibraryId} book={book} />
        ))}
      </div>
    </section>
  );
}
