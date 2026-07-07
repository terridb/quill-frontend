import { describe, expect, it } from "vitest";
import {
  getBookExclusion,
  isExcludedVolume,
} from "@/src/lib/books/google-books/book-exclusion";
import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

function makeVolume(
  id: string,
  isbn = "9780000000000",
): GoogleBooksVolume {
  return {
    id,
    volumeInfo: {
      printType: "BOOK",
      industryIdentifiers: [{ type: "ISBN_13", identifier: isbn }],
    },
  };
}

describe("book exclusion", () => {
  it("excludes volumes with the same id", () => {
    const source = makeVolume("source-id");
    const exclusion = getBookExclusion(source);

    expect(isExcludedVolume(makeVolume("source-id", "9781111111111"), exclusion)).toBe(
      true,
    );
  });

  it("excludes volumes that share an isbn with the source", () => {
    const source = makeVolume("source-id", "978-0-123456-78-9");
    const exclusion = getBookExclusion(source);

    expect(isExcludedVolume(makeVolume("other-edition-id", "9780123456789"), exclusion)).toBe(
      true,
    );
  });

  it("does not exclude unrelated volumes", () => {
    const source = makeVolume("source-id", "9780000000001");
    const exclusion = getBookExclusion(source);

    expect(isExcludedVolume(makeVolume("other-id", "9780000000002"), exclusion)).toBe(
      false,
    );
  });
});
