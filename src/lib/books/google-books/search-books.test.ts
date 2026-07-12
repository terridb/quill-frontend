import { describe, expect, it } from "vitest";
import {
  mapGoogleBooksSearchVolumes,
  parseGoogleBooksSearchVolumes,
} from "@/src/lib/books/google-books/search-books";

describe("parseGoogleBooksSearchVolumes", () => {
  it("returns valid volumes and skips malformed items", () => {
    const volumes = parseGoogleBooksSearchVolumes({
      items: [
        { id: "valid-id", volumeInfo: { title: "Valid Book" } },
        { volumeInfo: { title: "Missing id" } },
        null,
        "not-an-object",
      ],
    });

    expect(volumes).toEqual([
      { id: "valid-id", volumeInfo: { title: "Valid Book" } },
    ]);
  });

  it("returns an empty array when items are missing", () => {
    expect(parseGoogleBooksSearchVolumes({})).toEqual([]);
    expect(parseGoogleBooksSearchVolumes(null)).toEqual([]);
  });
});

describe("mapGoogleBooksSearchVolumes", () => {
  it("accepts sparse search listings without isbn or printType", () => {
    const results = mapGoogleBooksSearchVolumes([
      {
        id: "_NrbEAAAQBAJ",
        volumeInfo: {
          title: "Fourth Wing",
          authors: ["Rebecca Yarros"],
        },
      },
    ]);

    expect(results).toEqual([
      {
        bookId: "_NrbEAAAQBAJ",
        title: "Fourth Wing",
        authors: "Rebecca Yarros",
        coverUrl: null,
      },
    ]);
  });
});
