import { describe, expect, it } from "vitest";
import { getBookExclusion } from "@/src/lib/books/google-books/book-exclusion";
import {
  rankRelatedVolumes,
  scoreRelatedBook,
} from "@/src/lib/books/google-books/score-related-books";
import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

function makeVolume(
  id: string,
  categories: string[] | undefined,
  isbn = "9780000000000",
): GoogleBooksVolume {
  return {
    id,
    volumeInfo: {
      categories,
      printType: "BOOK",
      industryIdentifiers: [{ type: "ISBN_13", identifier: isbn }],
    },
  };
}

describe("scoreRelatedBook", () => {
  const source = {
    genreLabels: ["Fantasy"],
    subjectTags: ["Epic", "Dragons"],
  };

  it("scores higher when more categories overlap", () => {
    const strongMatch = makeVolume("strong", [
      "Fiction / Fantasy / Epic",
      "Dragons",
    ]);
    const weakMatch = makeVolume("weak", ["Fiction / Fantasy"]);
    const noMatch = makeVolume("none", ["Fiction / Romance"]);

    expect(scoreRelatedBook(strongMatch, source)).toBeGreaterThan(
      scoreRelatedBook(weakMatch, source),
    );
    expect(scoreRelatedBook(weakMatch, source)).toBeGreaterThan(
      scoreRelatedBook(noMatch, source),
    );
  });

  it("returns zero when there is no overlap", () => {
    const volume = makeVolume("romance", ["Fiction / Romance"]);

    expect(scoreRelatedBook(volume, source)).toBe(0);
  });
});

describe("rankRelatedVolumes", () => {
  const source = {
    genreLabels: ["Fantasy"],
    subjectTags: ["Epic"],
  };

  it("ranks overlapping volumes above unrelated ones", () => {
    const volumes = [
      makeVolume("unrelated", ["Fiction / Romance"], "9780000000001"),
      makeVolume("related", ["Fiction / Fantasy / Epic"], "9780000000002"),
      makeVolume("source", ["Fiction / Fantasy / Epic"], "9780000000003"),
    ];
    const exclusion = getBookExclusion(volumes[2]!);

    const ranked = rankRelatedVolumes(volumes, source, exclusion, 2);

    expect(ranked.map((volume) => volume.id)).toEqual(["related", "unrelated"]);
  });

  it("excludes the source book id and shared isbn editions", () => {
    const sourceVolume = makeVolume("source", ["Fiction / Fantasy / Epic"], "9780000000003");
    const volumes = [
      sourceVolume,
      makeVolume("same-isbn-edition", ["Fiction / Fantasy / Epic"], "9780000000003"),
      makeVolume("other", ["Fiction / Fantasy / Epic"], "9780000000004"),
    ];
    const exclusion = getBookExclusion(sourceVolume);

    const ranked = rankRelatedVolumes(volumes, source, exclusion, 5);

    expect(ranked.map((volume) => volume.id)).toEqual(["other"]);
  });
});
