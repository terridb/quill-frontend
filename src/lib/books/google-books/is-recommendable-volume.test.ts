import { describe, expect, it } from "vitest";
import { getBookExclusion } from "@/src/lib/books/google-books/book-exclusion";
import {
  getVolumeLanguage,
  hasVolumeCover,
  isRecommendableVolume,
  matchesVolumeLanguage,
} from "@/src/lib/books/google-books/is-recommendable-volume";
import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

function makeVolume(options: {
  id: string;
  isbn?: string;
  language?: string;
  imageLinks?: GoogleBooksVolume["volumeInfo"]["imageLinks"];
}): GoogleBooksVolume {
  return {
    id: options.id,
    volumeInfo: {
      printType: "BOOK",
      language: options.language,
      imageLinks: options.imageLinks,
      industryIdentifiers: options.isbn
        ? [{ type: "ISBN_13", identifier: options.isbn }]
        : [{ type: "ISBN_13", identifier: "9780000000000" }],
    },
  };
}

describe("recommendable volume filters", () => {
  const source = makeVolume({
    id: "source",
    isbn: "9780000000001",
    language: "nl",
    imageLinks: { thumbnail: "https://example.com/cover.jpg" },
  });
  const exclusion = getBookExclusion(source);

  it("reads the volume language as lowercase iso code", () => {
    expect(getVolumeLanguage(makeVolume({ id: "nl", language: "NL" }))).toBe("nl");
  });

  it("requires matching language when the source language is known", () => {
    expect(
      matchesVolumeLanguage(makeVolume({ id: "match", language: "nl" }), "nl"),
    ).toBe(true);
    expect(
      matchesVolumeLanguage(makeVolume({ id: "other", language: "en" }), "nl"),
    ).toBe(false);
  });

  it("allows any language when the source language is unknown", () => {
    expect(
      matchesVolumeLanguage(makeVolume({ id: "any", language: "en" }), null),
    ).toBe(true);
  });

  it("allows unknown language when configured for author recommendations", () => {
    expect(
      matchesVolumeLanguage(makeVolume({ id: "unknown-lang" }), "en", true),
    ).toBe(true);
    expect(
      matchesVolumeLanguage(makeVolume({ id: "unknown-lang" }), "en", false),
    ).toBe(false);
  });

  it("excludes volumes without a cover image", () => {
    expect(
      isRecommendableVolume(
        makeVolume({ id: "no-cover", language: "nl" }),
        { exclusion, language: "nl" },
      ),
    ).toBe(false);

    expect(
      isRecommendableVolume(
        makeVolume({
          id: "with-cover",
          language: "nl",
          imageLinks: { thumbnail: "https://example.com/cover.jpg" },
        }),
        { exclusion, language: "nl" },
      ),
    ).toBe(true);
  });
});
