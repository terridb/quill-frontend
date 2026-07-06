import { bookSearchQuerySchema } from "@/src/lib/books/schemas";
import { searchBooks } from "@/src/lib/books/search-books";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = bookSearchQuerySchema.safeParse({
    q: searchParams.get("q") ?? "",
  });

  if (!parsed.success) {
    return Response.json(
      { error: "Query must be between 2 and 200 characters" },
      { status: 400 },
    );
  }

  try {
    const results = await searchBooks(parsed.data.q);
    return Response.json({ results });
  } catch (error) {
    console.error("Book search failed:", error);
    return Response.json(
      { error: "Unable to search books right now" },
      { status: 500 },
    );
  }
}
