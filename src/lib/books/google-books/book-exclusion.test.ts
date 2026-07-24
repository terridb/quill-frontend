import { describe, expect, it } from "vitest";
import {
  getBookExclusion,
  isExcludedVolume,
} from "@/src/lib/books/google-books/book-exclusion";
import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

function makeVolume(
  id: string,
  options?: {
    isbn?: string;
    title?: string;
    authors?: string[];
  },
): GoogleBooksVolume {
  return {
    id,
    volumeInfo: {
      printType: "BOOK",
      title: options?.title,
      authors: options?.authors,
      industryIdentifiers: options?.isbn
        ? [{ type: "ISBN_13", identifier: options.isbn }]
        : [{ type: "ISBN_13", identifier: "9780000000000" }],
    },
  };
}

describe("book exclusion", () => {
  it("excludes volumes with the same id", () => {
    const source = makeVolume("source-id");
    const exclusion = getBookExclusion(source);

    expect(
      isExcludedVolume(makeVolume("source-id", { isbn: "9781111111111" }), exclusion),
    ).toBe(true);
  });

  it("excludes volumes that share an isbn with the source", () => {
    const source = makeVolume("source-id", { isbn: "978-0-123456-78-9" });
    const exclusion = getBookExclusion(source);

    expect(
      isExcludedVolume(
        makeVolume("other-edition-id", { isbn: "9780123456789" }),
        exclusion,
      ),
    ).toBe(true);
  });

  it("excludes other editions of the same title and author", () => {
    const source = makeVolume("ztdIEQAAQBAJ", {
      title: "Mate",
      authors: ["Ali Hazelwood"],
      isbn: "9781408722725",
    });
    const exclusion = getBookExclusion(source);

    expect(
      isExcludedVolume(
        makeVolume("UUdKEQAAQBAJ", {
          title: "Mate",
          authors: ["Ali Hazelwood"],
          isbn: "9780593550403",
        }),
        exclusion,
      ),
    ).toBe(true);
  });

  it("does not exclude unrelated volumes", () => {
    const source = makeVolume("source-id", {
      isbn: "9780000000001",
      title: "Mate",
      authors: ["Ali Hazelwood"],
    });
    const exclusion = getBookExclusion(source);

    expect(
      isExcludedVolume(
        makeVolume("other-id", {
          isbn: "9780000000002",
          title: "Bride",
          authors: ["Ali Hazelwood"],
        }),
        exclusion,
      ),
    ).toBe(false);
  });
});
