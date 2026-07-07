import { describe, expect, it } from "vitest";
import { getBookExclusion } from "@/src/lib/books/google-books/book-exclusion";
import {
  GENRE_MATCH_SCORE,
  getMinRelatedScore,
  hasGenreOverlap,
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

describe("hasGenreOverlap", () => {
  const source = {
    genreLabels: ["Romance"],
    subjectTags: [],
  };

  it("returns true when genres overlap", () => {
    const volume = makeVolume("match", ["Fiction / Romance / Contemporary"]);
    expect(hasGenreOverlap(volume, source)).toBe(true);
  });

  it("returns false when genres do not overlap", () => {
    const volume = makeVolume("miss", ["Fiction / Mystery"]);
    expect(hasGenreOverlap(volume, source)).toBe(false);
  });
});

describe("getMinRelatedScore", () => {
  it("uses genre match threshold when genres are known", () => {
    expect(getMinRelatedScore(["Romance"])).toBe(GENRE_MATCH_SCORE);
  });

  it("requires a stronger match when the source has multiple genres", () => {
    expect(getMinRelatedScore(["Fantasy", "Romance"])).toBe(3);
  });

  it("uses subject overlap threshold when genres are unknown", () => {
    expect(getMinRelatedScore([])).toBe(3);
  });
});

describe("rankRelatedVolumes", () => {
  const source = {
    genreLabels: ["Fantasy"],
    subjectTags: ["Epic"],
  };

  it("returns only volumes meeting the minimum score", () => {
    const volumes = [
      makeVolume("unrelated", ["Fiction / Romance"], "9780000000001"),
      makeVolume("related", ["Fiction / Fantasy / Epic"], "9780000000002"),
      makeVolume("source", ["Fiction / Fantasy / Epic"], "9780000000003"),
    ];
    const exclusion = getBookExclusion(volumes[2]!);

    const ranked = rankRelatedVolumes(volumes, source, exclusion, {
      maxResults: 5,
      minScore: getMinRelatedScore(source.genreLabels),
    });

    expect(ranked.map((volume) => volume.id)).toEqual(["related"]);
  });

  it("does not backfill with zero-score volumes", () => {
    const volumes = [
      makeVolume("unrelated-a", ["Fiction / Romance"], "9780000000001"),
      makeVolume("unrelated-b", ["Fiction / Mystery"], "9780000000002"),
    ];
    const exclusion = getBookExclusion(
      makeVolume("source", ["Fiction / Fantasy / Epic"], "9780000000003"),
    );

    const ranked = rankRelatedVolumes(volumes, source, exclusion, {
      maxResults: 20,
      minScore: getMinRelatedScore(source.genreLabels),
    });

    expect(ranked).toEqual([]);
  });

  it("requires genre overlap when configured for commercial fiction", () => {
    const romanceSource = {
      genreLabels: ["Romance"],
      subjectTags: ["Contemporary"],
    };
    const volumes = [
      makeVolume("academic", ["Social Science / Women's Studies"], "9780000000001"),
      makeVolume("romance", ["Fiction / Romance / Contemporary"], "9780000000002"),
    ];
    const exclusion = getBookExclusion(
      makeVolume("source", ["Fiction / Romance / Contemporary"], "9780000000003"),
    );

    const ranked = rankRelatedVolumes(volumes, romanceSource, exclusion, {
      maxResults: 5,
      minScore: getMinRelatedScore(romanceSource.genreLabels),
      sourceBookKind: "fiction",
    });

    expect(ranked.map((volume) => volume.id)).toEqual(["romance"]);
  });

  it("scores sparse search listings from genre-targeted discovery", () => {
    const volumes: GoogleBooksVolume[] = [
      {
        id: "listing",
        volumeInfo: {
          title: "Fourth Wing",
          authors: ["Rebecca Yarros"],
        },
      },
    ];
    const exclusion = getBookExclusion(
      makeVolume("source", ["Fiction / Fantasy / Romance"], "9780000000003"),
    );

    const ranked = rankRelatedVolumes(volumes, source, exclusion, {
      maxResults: 5,
      minScore: getMinRelatedScore(source.genreLabels),
      sourceBookKind: "fiction",
    });

    expect(ranked.map((volume) => volume.id)).toEqual(["listing"]);
  });

  it("scores sparse fiction metadata from genre-targeted search", () => {
    const volumes = [
      makeVolume("sparse-fiction", ["Fiction"], "9780000000006"),
    ];
    const exclusion = getBookExclusion(
      makeVolume("source", ["Fiction / Fantasy / Romance"], "9780000000003"),
    );

    const ranked = rankRelatedVolumes(volumes, source, exclusion, {
      maxResults: 5,
      minScore: getMinRelatedScore(source.genreLabels),
      sourceBookKind: "fiction",
    });

    expect(ranked.map((volume) => volume.id)).toEqual(["sparse-fiction"]);
  });

  it("includes genre-only matches for commercial fiction", () => {
    const volumes = [
      makeVolume("genre-match", ["Fiction / Fantasy"], "9780000000005"),
    ];
    const exclusion = getBookExclusion(
      makeVolume("source", ["Fiction / Fantasy / Epic"], "9780000000003"),
    );

    const ranked = rankRelatedVolumes(volumes, source, exclusion, {
      maxResults: 5,
      minScore: getMinRelatedScore(source.genreLabels),
      sourceBookKind: "fiction",
    });

    expect(ranked.map((volume) => volume.id)).toEqual(["genre-match"]);
  });

  it("ranks popular ties above obscure books with the same relevance score", () => {
    const volumes: GoogleBooksVolume[] = [
      {
        id: "obscure",
        volumeInfo: {
          title: "Obscure Old Fantasy",
          ratingsCount: 1,
          publishedDate: "1972-01-01",
        },
      },
      {
        id: "popular",
        volumeInfo: {
          title: "Fourth Wing",
          ratingsCount: 180_000,
          averageRating: 4.6,
          publishedDate: "2023-04-04",
        },
      },
    ];
    const exclusion = getBookExclusion(
      makeVolume("source", ["Fiction / Fantasy / Romance"], "9780000000003"),
    );

    const ranked = rankRelatedVolumes(volumes, source, exclusion, {
      maxResults: 5,
      minScore: getMinRelatedScore(source.genreLabels),
      sourceBookKind: "fiction",
    });

    expect(ranked.map((volume) => volume.id)).toEqual(["popular"]);
  });

  it("excludes the source book id and shared isbn editions", () => {
    const sourceVolume = makeVolume("source", ["Fiction / Fantasy / Epic"], "9780000000003");
    const volumes = [
      sourceVolume,
      makeVolume("same-isbn-edition", ["Fiction / Fantasy / Epic"], "9780000000003"),
      makeVolume("other", ["Fiction / Fantasy / Epic"], "9780000000004"),
    ];
    const exclusion = getBookExclusion(sourceVolume);

    const ranked = rankRelatedVolumes(volumes, source, exclusion, { maxResults: 5 });

    expect(ranked.map((volume) => volume.id)).toEqual(["other"]);
  });
});
