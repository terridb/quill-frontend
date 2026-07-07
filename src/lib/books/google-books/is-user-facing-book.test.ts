import { describe, expect, it } from "vitest";
import {
  isListedBookVolume,
  isUserFacingBook,
} from "@/src/lib/books/google-books/is-user-facing-book";
import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

function makeVolume(
  overrides: Partial<GoogleBooksVolume["volumeInfo"]> = {},
): GoogleBooksVolume {
  return {
    id: "volume",
    volumeInfo: {
      title: "Fourth Wing",
      authors: ["Rebecca Yarros"],
      imageLinks: { thumbnail: "https://example.com/cover.jpg" },
      ...overrides,
    },
  };
}

describe("isListedBookVolume", () => {
  it("accepts sparse search listings without isbn or printType", () => {
    expect(isListedBookVolume(makeVolume())).toBe(true);
    expect(isUserFacingBook(makeVolume())).toBe(false);
  });

  it("rejects non-book print types", () => {
    expect(isListedBookVolume(makeVolume({ printType: "MAGAZINE" }))).toBe(false);
  });
});
