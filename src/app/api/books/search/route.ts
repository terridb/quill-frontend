import { searchOpenLibraryBooks } from "@/src/lib/openlibrary/search-books";
import { bookSearchQuerySchema } from "@/src/lib/openlibrary/schemas";

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
    const results = await searchOpenLibraryBooks(parsed.data.q);
    return Response.json({ results });
  } catch (error) {
    console.error("Book search failed:", error);
    return Response.json(
      { error: "Unable to search books right now" },
      { status: 500 },
    );
  }
}
