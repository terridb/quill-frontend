import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookDetailPage } from "@/src/components/book/BookDetailPage";
import {
  fetchBookDetail,
  isBookNotFoundError,
} from "@/src/lib/openlibrary/fetch-book-detail";
import { parseBookRouteSlug } from "@/src/lib/openlibrary/book-path";

export const revalidate = 86400;

type BookPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseBookRouteSlug(slug);

  if (!parsed) {
    return { title: "Book not found · Quill" };
  }

  try {
    const book = await fetchBookDetail(parsed.openLibraryId);
    const description = book.description?.slice(0, 160) ?? undefined;

    return {
      title: `${book.title} · Quill`,
      description,
    };
  } catch {
    return { title: "Book · Quill" };
  }
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params;
  const parsed = parseBookRouteSlug(slug);

  if (!parsed) {
    notFound();
  }

  try {
    const book = await fetchBookDetail(parsed.openLibraryId);
    return <BookDetailPage book={book} />;
  } catch (error) {
    if (isBookNotFoundError(error)) {
      notFound();
    }
    throw error;
  }
}
