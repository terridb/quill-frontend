import { describe, expect, it } from "vitest";
import { getBookKind, matchesBookKind } from "@/src/lib/books/google-books/book-kind";
import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

function makeVolume(categories?: string[], mainCategory?: string): GoogleBooksVolume {
  return {
    id: "test",
    volumeInfo: {
      categories,
      mainCategory,
      printType: "BOOK",
    },
  };
}

describe("getBookKind", () => {
  it("detects fiction from category paths", () => {
    expect(
      getBookKind(makeVolume(["Fiction / Romance / Contemporary"])),
    ).toBe("fiction");
  });

  it("detects fiction from mainCategory", () => {
    expect(getBookKind(makeVolume(undefined, "Fiction"))).toBe("fiction");
  });

  it("detects nonfiction from biography categories", () => {
    expect(
      getBookKind(makeVolume(["Biography & Autobiography / Historical"])),
    ).toBe("nonfiction");
  });

  it("detects nonfiction from social science categories", () => {
    expect(
      getBookKind(makeVolume(["Social Science / Women's Studies"])),
    ).toBe("nonfiction");
  });

  it("returns unknown when categories are empty", () => {
    expect(getBookKind(makeVolume())).toBe("unknown");
  });

  it("prefers fiction when both fiction and nonfiction signals appear", () => {
    expect(
      getBookKind(makeVolume(["Fiction / Historical Fiction / History"])),
    ).toBe("fiction");
  });
});

describe("matchesBookKind", () => {
  it("allows unknown kinds to match anything", () => {
    expect(matchesBookKind("unknown", "fiction")).toBe(true);
    expect(matchesBookKind("fiction", "unknown")).toBe(true);
  });

  it("rejects fiction and nonfiction mismatches", () => {
    expect(matchesBookKind("fiction", "nonfiction")).toBe(false);
    expect(matchesBookKind("nonfiction", "fiction")).toBe(false);
  });

  it("accepts matching kinds", () => {
    expect(matchesBookKind("fiction", "fiction")).toBe(true);
  });
});
