import { describe, expect, it } from "vitest";
import {
  getPopularityScore,
  isObscureLegacyVolume,
} from "@/src/lib/books/google-books/volume-popularity";
import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

function makeVolume(
  overrides: Partial<GoogleBooksVolume["volumeInfo"]> = {},
): GoogleBooksVolume {
  return {
    id: "volume",
    volumeInfo: {
      title: "Test Book",
      ...overrides,
    },
  };
}

describe("volume popularity", () => {
  it("scores popular recent books higher than obscure legacy titles", () => {
    const popular = makeVolume({
      ratingsCount: 120_000,
      averageRating: 4.6,
      publishedDate: "2023-05-02",
    });
    const obscure = makeVolume({
      ratingsCount: 2,
      averageRating: 3.0,
      publishedDate: "1978-01-01",
    });

    expect(getPopularityScore(popular)).toBeGreaterThan(getPopularityScore(obscure));
    expect(isObscureLegacyVolume(obscure)).toBe(true);
    expect(isObscureLegacyVolume(popular)).toBe(false);
  });
});
