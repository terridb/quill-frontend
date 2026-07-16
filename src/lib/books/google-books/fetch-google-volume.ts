import { googleBooksFetch } from "@/src/lib/books/google-books/client";
import { isListedBookVolume } from "@/src/lib/books/google-books/is-user-facing-book";
import { googleBooksVolumeSchema } from "@/src/lib/books/google-books/schemas";
import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

export async function fetchGoogleVolume(
  apiId: string,
): Promise<GoogleBooksVolume> {
  let response: Response;

  try {
    response = await googleBooksFetch(`/volumes/${encodeURIComponent(apiId)}`);
  } catch {
    throw new Error("Unable to reach Google Books");
  }

  if (!response.ok) {
    throw new Error("Book not found");
  }

  const json: unknown = await response.json();
  const parsed = googleBooksVolumeSchema.safeParse(json);

  if (!parsed.success || !isListedBookVolume(parsed.data)) {
    throw new Error("Book not found");
  }

  return parsed.data;
}
