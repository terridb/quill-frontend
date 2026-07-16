import { describe, expect, it } from "vitest";
import { mergeSearchResults } from "@/src/lib/books/search-books";
import type { BookSearchResult } from "@/src/types/book";

function makeResult(bookId: string): BookSearchResult {
  return {
    bookId,
    title: `Title ${bookId}`,
    authors: "Author",
    coverUrl: null,
    language: null,
  };
}

describe("mergeSearchResults", () => {
  it("returns only local results when limit is reached", () => {
    const local = Array.from({ length: 20 }, (_, index) =>
      makeResult(`local-${index}`),
    );
    const remote = [makeResult("remote-1")];

    expect(mergeSearchResults(local, remote)).toEqual(local);
  });

  it("fills remaining slots from remote results without duplicates", () => {
    const local = [makeResult("shared-id"), makeResult("local-only")];
    const remote = [
      makeResult("shared-id"),
      makeResult("remote-only"),
      makeResult("remote-extra"),
    ];

    expect(mergeSearchResults(local, remote, 4)).toEqual([
      makeResult("shared-id"),
      makeResult("local-only"),
      makeResult("remote-only"),
      makeResult("remote-extra"),
    ]);
  });
});
