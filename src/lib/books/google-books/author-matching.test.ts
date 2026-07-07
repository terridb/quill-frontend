import { describe, expect, it } from "vitest";
import {
  appendAuthorExclusionToQuery,
  buildAuthorExclusionQuery,
  buildAuthorSearchQueries,
  normalizeAuthorName,
  relatedBookIncludesAuthor,
  volumeIncludesAuthor,
} from "@/src/lib/books/google-books/author-matching";
import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

function makeVolume(authors: string[]): GoogleBooksVolume {
  return {
    id: "volume",
    volumeInfo: {
      authors,
      printType: "BOOK",
      industryIdentifiers: [{ type: "ISBN_13", identifier: "9780000000000" }],
    },
  };
}

describe("author matching", () => {
  it("normalizes author names for comparison", () => {
    expect(normalizeAuthorName("Sarah J. Maas")).toBe("sarah j maas");
    expect(normalizeAuthorName("Sarah J Maas")).toBe("sarah j maas");
  });

  it("builds multiple author search queries for names with initials", () => {
    const queries = buildAuthorSearchQueries("Sarah J. Maas");

    expect(queries).toContain('inauthor:"Sarah J. Maas"');
    expect(queries).toContain('inauthor:"Sarah J Maas"');
    expect(queries).toContain('inauthor:"Sarah Maas"');
  });

  it("builds a negated inauthor clause for related-book search", () => {
    expect(buildAuthorExclusionQuery("Sarah J. Maas")).toBe('-inauthor:"Sarah Maas"');
  });

  it("appends author exclusion to a related-book query", () => {
    const query = appendAuthorExclusionToQuery("subject:fantasy", "Sarah J. Maas");

    expect(query).toBe('subject:fantasy+-inauthor:"Sarah Maas"');
  });

  it("matches equivalent author name forms on a volume", () => {
    const volume = makeVolume(["Sarah J Maas"]);

    expect(volumeIncludesAuthor(volume, "Sarah J. Maas")).toBe(true);
    expect(volumeIncludesAuthor(volume, "Sarah Maas")).toBe(true);
    expect(volumeIncludesAuthor(volume, "Brandon Sanderson")).toBe(false);
  });

  it("matches author names on related book author strings", () => {
    expect(relatedBookIncludesAuthor("Sarah J. Maas", "Sarah J. Maas")).toBe(true);
    expect(relatedBookIncludesAuthor("Sarah J. Maas, Other Author", "Sarah Maas")).toBe(
      true,
    );
    expect(relatedBookIncludesAuthor("Rebecca Yarros", "Sarah J. Maas")).toBe(false);
  });
});
