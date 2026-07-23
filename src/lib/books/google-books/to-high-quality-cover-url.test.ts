import { describe, expect, it } from "vitest";
import {
  getCoverUrlCandidates,
  isPlausibleBookCover,
  toHighQualityCoverUrl,
} from "@/src/lib/books/google-books/to-high-quality-cover-url";

const stored =
  "https://books.google.com/books/content?id=1MXLDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=TOKEN&source=gbs_api";

describe("getCoverUrlCandidates", () => {
  it("returns an empty list for null", () => {
    expect(getCoverUrlCandidates(null, "high")).toEqual([]);
  });

  it("leaves non-Google URLs as a single candidate", () => {
    const url = "https://example.com/covers/dune.jpg";
    expect(getCoverUrlCandidates(url, "high")).toEqual([url]);
  });

  it("lists high-quality zooms then the original URL", () => {
    const candidates = getCoverUrlCandidates(stored, "high");

    expect(candidates[0]).toContain("zoom=4");
    expect(candidates[1]).toContain("zoom=3");
    expect(candidates[2]).toContain("zoom=2");
    expect(candidates[3]).toContain("zoom=1");
    expect(candidates[0]).not.toContain("imgtk=");
    expect(candidates[0]).not.toContain("edge=");
    expect(candidates.at(-1)).toBe(stored);
  });

  it("lists medium-quality zooms then the original URL", () => {
    const candidates = getCoverUrlCandidates(stored, "medium");

    expect(candidates.map((url) => new URL(url).searchParams.get("zoom"))).toEqual([
      "2",
      "1",
      "1",
    ]);
    expect(candidates.at(-1)).toBe(stored);
  });
});

describe("toHighQualityCoverUrl", () => {
  it("returns the preferred high-quality candidate", () => {
    expect(toHighQualityCoverUrl(stored)).toBe(
      "https://books.google.com/books/content?id=1MXLDwAAQBAJ&printsec=frontcover&img=1&zoom=4&source=gbs_api",
    );
  });

  it("returns null for null input", () => {
    expect(toHighQualityCoverUrl(null)).toBeNull();
  });

  it("returns the original string when the URL is invalid", () => {
    expect(toHighQualityCoverUrl("not a url")).toBe("not a url");
  });
});

describe("isPlausibleBookCover", () => {
  it("accepts portrait cover dimensions", () => {
    expect(isPlausibleBookCover(800, 1200)).toBe(true);
    expect(isPlausibleBookCover(128, 205)).toBe(true);
  });

  it("rejects strips and tiny images", () => {
    expect(isPlausibleBookCover(575, 92)).toBe(false);
    expect(isPlausibleBookCover(20, 30)).toBe(false);
  });
});
