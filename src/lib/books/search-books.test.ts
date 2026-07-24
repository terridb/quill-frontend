import { describe, expect, it } from "vitest";
import { mergeSearchResults } from "@/src/lib/books/search-books";
import type { BookSearchResult } from "@/src/types/book";

function makeResult(
  bookId: string,
  overrides?: Partial<BookSearchResult>,
): BookSearchResult {
  return {
    bookId,
    title: overrides?.title ?? `Title ${bookId}`,
    authors: overrides?.authors ?? "Author",
    coverUrl: null,
    language: null,
  };
}

describe("mergeSearchResults", () => {
  it("interleaves remote results even when local fills the limit", () => {
    const local = Array.from({ length: 20 }, (_, index) =>
      makeResult(`local-${index}`, { title: `Local ${index}` }),
    );
    const remote = [
      makeResult("remote-1", { title: "Love Theoretically" }),
      makeResult("remote-2", { title: "Remote Extra" }),
    ];

    const merged = mergeSearchResults(local, remote, 4);

    expect(merged.map((book) => book.bookId)).toEqual([
      "remote-1",
      "local-0",
      "remote-2",
      "local-1",
    ]);
  });

  it("dedupes shared api ids and keeps remote-first order", () => {
    const local = [makeResult("shared-id"), makeResult("local-only")];
    const remote = [
      makeResult("shared-id"),
      makeResult("remote-only"),
      makeResult("remote-extra"),
    ];

    expect(mergeSearchResults(local, remote, 4).map((book) => book.bookId)).toEqual(
      ["shared-id", "remote-only", "local-only", "remote-extra"],
    );
  });

  it("prefers the catalog edition when the same work appears remotely", () => {
    const local = [
      makeResult("local-edition", {
        title: "Love Theoretically",
        authors: "Ali Hazelwood",
      }),
    ];
    const remote = [
      makeResult("google-edition", {
        title: "Love Theoretically",
        authors: "Ali Hazelwood",
      }),
      makeResult("other-remote", {
        title: "The Love Hypothesis",
        authors: "Ali Hazelwood",
      }),
    ];

    expect(mergeSearchResults(local, remote, 3).map((book) => book.bookId)).toEqual(
      ["local-edition", "other-remote"],
    );
  });

  it("fills from the remaining source when one side is short", () => {
    const local = [makeResult("local-1"), makeResult("local-2")];
    const remote = [makeResult("remote-1")];

    expect(mergeSearchResults(local, remote, 3).map((book) => book.bookId)).toEqual(
      ["remote-1", "local-1", "local-2"],
    );
  });
});
