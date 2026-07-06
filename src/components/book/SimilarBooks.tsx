import type { RelatedBook } from "@/src/types/book";
import { BookCarousel } from "@/src/components/book/BookCarousel";

export interface SimilarBooksProps {
  books: RelatedBook[];
}

export function SimilarBooks({ books }: SimilarBooksProps) {
  if (books.length === 0) {
    return null;
  }

  return (
    <section
      className="book-section-rule w-full min-w-0 overflow-x-clip"
      aria-labelledby="similar-books-heading"
    >
      <h2
        id="similar-books-heading"
        className="text-display text-lg text-[var(--color-ink)]"
      >
        More like this
      </h2>
      <BookCarousel books={books} />
    </section>
  );
}
