const GOOGLE_BOOKS_BASE = "https://www.googleapis.com/books/v1";

export function getGoogleBooksApiKey(): string {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_BOOKS_API_KEY is not configured");
  }
  return key;
}

export async function googleBooksFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = new URL(`${GOOGLE_BOOKS_BASE}${path}`);
  url.searchParams.set("key", getGoogleBooksApiKey());

  return fetch(url.toString(), {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });
}
