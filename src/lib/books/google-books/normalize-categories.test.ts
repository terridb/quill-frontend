import { describe, expect, it } from "vitest";
import {
  buildRelatedBookSearchQueries,
  normalizeCategories,
} from "@/src/lib/books/google-books/normalize-categories";

describe("normalizeCategories", () => {
  it("extracts fantasy and romance genres from typical YA fantasy paths", () => {
    const { genreLabels, subjectTags } = normalizeCategories([
      "Fiction / Fantasy / Romance",
    ]);

    expect(genreLabels).toEqual(["Fantasy", "Romance"]);
    expect(subjectTags).toEqual([]);
  });
});

describe("buildRelatedBookSearchQueries", () => {
  it("prioritizes genre and strong subject combinations", () => {
    const queries = buildRelatedBookSearchQueries(
      ["Fantasy"],
      ["Epic", "Dragons"],
      { bookKind: "fiction" },
    );

    expect(queries[0]).toBe("subject:fantasy+subject:epic");
    expect(queries).toContain("subject:fantasy+subject:dragons");
    expect(queries).toContain("subject:dragons");
    expect(queries.some((query) => query === "subject:epic")).toBe(false);
  });

  it("reserves a primary genre fallback when strong subject tags exist", () => {
    const queries = buildRelatedBookSearchQueries(["Fantasy"], ["Dragons"], {
      bookKind: "fiction",
    });

    expect(queries).toContain("subject:fantasy+subject:dragons");
    expect(queries.at(-1)).toBe("subject:fantasy");
  });

  it("builds genre queries for fantasy romance without subject tags", () => {
    const queries = buildRelatedBookSearchQueries(
      ["Fantasy", "Romance"],
      [],
      { bookKind: "fiction" },
    );

    expect(queries[0]).toBe("subject:fantasy+subject:romance");
    expect(queries).toContain("subject:fantasy+subject:young+adult");
    expect(queries).toContain("subject:fantasy");
    expect(queries).toContain("subject:romance");
  });

  it("falls back to genre-only queries when subject tags are empty", () => {
    const queries = buildRelatedBookSearchQueries(
      ["Mystery", "Thriller"],
      [],
      { bookKind: "fiction" },
    );

    expect(queries).toEqual([
      "subject:mystery+subject:thriller",
      "subject:mystery",
      "subject:thriller",
    ]);
  });

  it("uses subject tags when genre labels are empty", () => {
    const queries = buildRelatedBookSearchQueries([], ["World War II", "Europe"]);

    expect(queries[0]).toBe("subject:world+war+ii+subject:europe");
    expect(queries).toContain("subject:world+war+ii");
  });

  it("keeps weak subjects in genre pairs but not standalone queries", () => {
    const queries = buildRelatedBookSearchQueries(
      ["Fantasy", "Romance"],
      ["Epic", "Paranormal"],
      { bookKind: "fiction" },
    );

    expect(queries).toContain("subject:fantasy+subject:epic");
    expect(queries.some((query) => query === "subject:epic")).toBe(false);
    expect(queries.some((query) => query === "subject:paranormal")).toBe(false);
    expect(queries[0]).toBe("subject:fantasy+subject:romance");
  });

  it("excludes overly generic subjects from search queries", () => {
    const queries = buildRelatedBookSearchQueries(
      ["Romance"],
      ["Love", "Contemporary"],
      { bookKind: "fiction" },
    );

    expect(queries.some((query) => query.includes("subject:love"))).toBe(false);
    expect(queries).toContain("subject:contemporary");
    expect(queries).toContain("subject:romance+subject:contemporary");
    expect(queries.at(-1)).toBe("subject:romance");
  });

  it("does not prefix queries with subject:fiction", () => {
    const queries = buildRelatedBookSearchQueries(["Romance"], [], {
      bookKind: "fiction",
    });

    expect(queries.every((query) => !query.includes("subject:fiction"))).toBe(
      true,
    );
  });

  it("limits the number of queries", () => {
    const queries = buildRelatedBookSearchQueries(
      ["Fantasy", "Adventure", "Romance", "Horror"],
      ["Epic", "Magic", "Quest", "Heroes"],
      { bookKind: "fiction" },
    );

    expect(queries.length).toBeLessThanOrEqual(5);
  });
});
