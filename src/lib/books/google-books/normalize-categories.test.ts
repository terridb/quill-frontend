import { describe, expect, it } from "vitest";
import { buildRelatedBookSearchQueries } from "@/src/lib/books/google-books/normalize-categories";

describe("buildRelatedBookSearchQueries", () => {
  it("prioritizes combined subject tags before single subjects", () => {
    const queries = buildRelatedBookSearchQueries(
      ["Fantasy"],
      ["Epic", "Dragons"],
    );

    expect(queries[0]).toBe("subject:epic+subject:dragons");
    expect(queries).toContain("subject:epic");
    expect(queries).toContain("subject:dragons");
  });

  it("combines primary genre with subject tags before genre-only queries", () => {
    const queries = buildRelatedBookSearchQueries(["Fantasy"], ["Epic"]);

    const genreOnlyIndex = queries.indexOf("subject:fantasy");
    const combinedIndex = queries.indexOf("subject:fantasy+subject:epic");

    expect(combinedIndex).toBeGreaterThan(-1);
    expect(genreOnlyIndex).toBeGreaterThan(combinedIndex);
  });

  it("falls back to genre-only queries when subject tags are empty", () => {
    const queries = buildRelatedBookSearchQueries(["Mystery", "Thriller"], []);

    expect(queries).toEqual(["subject:mystery", "subject:thriller"]);
  });

  it("uses subject tags when genre labels are empty", () => {
    const queries = buildRelatedBookSearchQueries([], ["World War II", "Europe"]);

    expect(queries[0]).toBe("subject:world+war+ii+subject:europe");
    expect(queries).toContain("subject:world+war+ii");
  });

  it("limits the number of queries", () => {
    const queries = buildRelatedBookSearchQueries(
      ["Fantasy", "Adventure", "Romance", "Horror"],
      ["Epic", "Magic", "Quest", "Heroes"],
    );

    expect(queries.length).toBeLessThanOrEqual(5);
  });
});
