import { notFound } from "next/navigation";
import { parseBookRouteSlug } from "@/src/lib/openlibrary/book-path";

type BookPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params;
  const parsed = parseBookRouteSlug(slug);

  if (!parsed) {
    notFound();
  }

  const { openLibraryId } = parsed;

  return <div />;
}
