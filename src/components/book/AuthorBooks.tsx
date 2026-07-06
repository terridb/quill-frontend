import type { RelatedBook } from "@/src/types/book";
import { BookCarousel } from "@/src/components/book/BookCarousel";

export interface AuthorBooksProps {
  author: string;
  books: RelatedBook[];
}

export function AuthorBooks({ author, books }: AuthorBooksProps) {
  if (books.length === 0) {
    return null;
  }

  const headingId = "author-books-heading";

  return (
    <section
      className="book-section-rule w-full min-w-0 overflow-x-clip"
      aria-labelledby={headingId}
    >
      <h2
        id={headingId}
        className="text-display text-lg text-[var(--color-ink)]"
      >
        More books by {author}
      </h2>
      <BookCarousel books={books} />
    </section>
  );
}
