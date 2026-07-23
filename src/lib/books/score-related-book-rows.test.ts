import { describe, expect, it } from "vitest";
import { GENRE_MATCH_SCORE } from "@/src/lib/books/google-books/score-related-books";
import {
  rankRelatedBookRows,
  scoreRelatedBookRow,
  type RelatedBookRowCandidate,
} from "@/src/lib/books/score-related-book-rows";

function makeRow(
  overrides: Partial<RelatedBookRowCandidate> & Pick<RelatedBookRowCandidate, "api_id" | "title">,
): RelatedBookRowCandidate {
  return {
    author: "Test Author",
    cover_url: "https://example.com/cover.jpg",
    language: "en",
    genres: null,
    tags: null,
    shelf_count: 0,
    ...overrides,
  };
}

describe("scoreRelatedBookRow", () => {
  const source = {
    genreLabels: ["Fantasy"],
    subjectTags: ["Epic", "Dragons"],
  };

  it("scores higher when more categories overlap", () => {
    const strong = makeRow({
      api_id: "strong",
      title: "Strong",
      genres: ["Fantasy"],
      tags: ["Epic", "Dragons"],
    });
    const weak = makeRow({
      api_id: "weak",
      title: "Weak",
      genres: ["Fantasy"],
    });
    const none = makeRow({
      api_id: "none",
      title: "None",
      genres: ["Romance"],
    });

    expect(scoreRelatedBookRow(strong, source)).toBeGreaterThan(
      scoreRelatedBookRow(weak, source),
    );
    expect(scoreRelatedBookRow(weak, source)).toBeGreaterThan(
      scoreRelatedBookRow(none, source),
    );
  });

  it("returns zero when there is no overlap", () => {
    const row = makeRow({
      api_id: "romance",
      title: "Romance",
      genres: ["Romance"],
    });

    expect(scoreRelatedBookRow(row, source)).toBe(0);
  });
});

describe("rankRelatedBookRows", () => {
  const source = {
    genreLabels: ["Fantasy"],
    subjectTags: ["Epic"],
  };

  it("ranks by relevance then shelf popularity", () => {
    const ranked = rankRelatedBookRows(
      [
        makeRow({
          api_id: "popular-weak",
          title: "Popular Weak",
          genres: ["Fantasy"],
          shelf_count: 10,
        }),
        makeRow({
          api_id: "strong",
          title: "Strong Match",
          genres: ["Fantasy"],
          tags: ["Epic"],
          shelf_count: 1,
        }),
        makeRow({
          api_id: "miss",
          title: "Miss",
          genres: ["Romance"],
          shelf_count: 99,
        }),
      ],
      source,
      { minScore: GENRE_MATCH_SCORE },
    );

    expect(ranked.map((row) => row.api_id)).toEqual([
      "strong",
      "popular-weak",
    ]);
  });

  it("prefers matching language when relevance ties", () => {
    const ranked = rankRelatedBookRows(
      [
        makeRow({
          api_id: "fr",
          title: "French Fantasy",
          genres: ["Fantasy"],
          language: "fr",
          shelf_count: 2,
        }),
        makeRow({
          api_id: "en",
          title: "English Fantasy",
          genres: ["Fantasy"],
          language: "en",
          shelf_count: 2,
        }),
      ],
      source,
      { minScore: GENRE_MATCH_SCORE, language: "en" },
    );

    expect(ranked[0]?.api_id).toBe("en");
  });

  it("excludes fantasy romance for a contemporary romance source", () => {
    const romanceSource = {
      genreLabels: ["Romance"],
      subjectTags: ["Contemporary", "Romantic Comedy"],
    };

    const ranked = rankRelatedBookRows(
      [
        makeRow({
          api_id: "contemporary",
          title: "Lights Out",
          genres: ["Romance"],
          tags: ["Contemporary", "Romantic Comedy"],
          shelf_count: 0,
        }),
        makeRow({
          api_id: "fantasy-romance",
          title: "Onyx Storm",
          genres: ["Fantasy", "Romance"],
          tags: ["Epic"],
          shelf_count: 10,
        }),
      ],
      romanceSource,
      { minScore: GENRE_MATCH_SCORE },
    );

    expect(ranked.map((row) => row.api_id)).toEqual(["contemporary"]);
  });
});
