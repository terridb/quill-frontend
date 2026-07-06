import { describe, expect, it } from "vitest";
import { getBookExclusion } from "@/src/lib/books/google-books/book-exclusion";
import {
  getVolumeLanguage,
  hasVolumeCover,
  isRecommendableVolume,
  matchesVolumeLanguage,
  normalizeLanguageCode,
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

  it("matches language codes by primary subtag", () => {
    expect(matchesVolumeLanguage(makeVolume({ id: "gb", language: "en-GB" }), "en")).toBe(
      true,
    );
    expect(normalizeLanguageCode("en-GB")).toBe("en");
  });

  it("accepts sparse search listings for related-book recommendations", () => {
    const listing: GoogleBooksVolume = {
      id: "listing",
      volumeInfo: {
        title: "Fourth Wing",
        authors: ["Rebecca Yarros"],
        imageLinks: { thumbnail: "https://example.com/cover.jpg" },
      },
    };

    expect(
      isRecommendableVolume(listing, {
        exclusion,
        language: "en",
        sourceBookKind: "fiction",
        allowUnknownLanguage: true,
        allowSearchListings: true,
      }),
    ).toBe(true);
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

  it("rejects candidates with a mismatched book kind", () => {
    const fictionVolume: GoogleBooksVolume = {
      id: "fiction",
      volumeInfo: {
        printType: "BOOK",
        language: "nl",
        categories: ["Fiction / Romance"],
        imageLinks: { thumbnail: "https://example.com/cover.jpg" },
        industryIdentifiers: [{ type: "ISBN_13", identifier: "9780000000002" }],
      },
    };
    const nonfictionVolume: GoogleBooksVolume = {
      id: "nonfiction",
      volumeInfo: {
        printType: "BOOK",
        language: "nl",
        categories: ["Social Science / Women's Studies"],
        imageLinks: { thumbnail: "https://example.com/cover.jpg" },
        industryIdentifiers: [{ type: "ISBN_13", identifier: "9780000000003" }],
      },
    };

    expect(
      isRecommendableVolume(fictionVolume, {
        exclusion,
        language: "nl",
        sourceBookKind: "fiction",
      }),
    ).toBe(true);

    expect(
      isRecommendableVolume(nonfictionVolume, {
        exclusion,
        language: "nl",
        sourceBookKind: "fiction",
      }),
    ).toBe(false);
  });

  it("filters scholarly volumes for commercial fiction recommendations", () => {
    const scholarlyVolume: GoogleBooksVolume = {
      id: "scholarly",
      volumeInfo: {
        printType: "BOOK",
        language: "nl",
        categories: ["Social Science / Gender Studies"],
        imageLinks: { thumbnail: "https://example.com/cover.jpg" },
        industryIdentifiers: [{ type: "ISBN_13", identifier: "9780000000004" }],
      },
    };

    expect(
      isRecommendableVolume(scholarlyVolume, {
        exclusion,
        language: "nl",
        sourceBookKind: "fiction",
        filterScholarlyForFiction: true,
      }),
    ).toBe(false);
  });
});
