import type { BookDetail } from "@/src/types/open-library";
import { BookCover } from "@/src/components/book/BookCover";
import { BookDescription } from "@/src/components/book/BookDescription";
import { BookPageCount } from "@/src/components/book/BookPageCount";
import { BookStatusAction } from "@/src/components/book/BookStatusAction";
import { GenreChipList } from "@/src/components/book/GenreChipList";
import { SimilarBooks } from "@/src/components/book/SimilarBooks";

export interface BookDetailPageProps {
  book: BookDetail;
}

export function BookDetailPage({ book }: BookDetailPageProps) {
  const descriptionSectionClass =
    "mt-8 w-full border-t border-[var(--color-border)] pt-8";

  return (
    <article className="book-detail-page min-w-0 md:-mx-8 md:grid md:items-start md:grid-cols-[18rem_1fr] lg:grid-cols-[20rem_1fr]">
      <aside className="book-detail-sidebar flex flex-col items-center md:items-stretch md:border-r md:border-[var(--color-border)] md:px-6 md:py-10 lg:px-8">
        <BookCover
          coverUrl={book.coverUrl}
          title={book.title}
          className="aspect-[2/3] w-[11rem] shrink-0 md:w-full"
        />
        <BookStatusAction
          openLibraryId={book.openLibraryId}
          className="mt-5 hidden shrink-0 md:block"
        />
      </aside>

      <div className="mt-5 flex w-full min-w-0 flex-col items-center text-center md:mt-0 md:items-start md:px-8 md:py-10 md:text-left">
        <h1 className="text-display text-[1.75rem] leading-[1.15] tracking-tight text-[var(--color-ink)] lg:text-[2.25rem]">
          {book.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{book.authors}</p>
        <GenreChipList
          labels={book.genreLabels}
          className="justify-center md:justify-start"
        />
        <BookStatusAction
          openLibraryId={book.openLibraryId}
          className="md:hidden"
        />
        <BookPageCount numberOfPages={book.numberOfPages} />

        {book.description ? (
          <BookDescription
            description={book.description}
            subjectTags={book.subjectTags}
            className={descriptionSectionClass}
          />
        ) : book.subjectTags.length > 0 ? (
          <section className={descriptionSectionClass} aria-label="Subjects">
            <ul className="flex flex-wrap gap-2">
              {book.subjectTags.map((tag) => (
                <li key={tag}>
                  <span className="chip-muted">{tag}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <SimilarBooks books={book.relatedBooks} />
      </div>
    </article>
  );
}
