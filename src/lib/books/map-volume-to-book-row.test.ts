import { describe, expect, it } from "vitest";
import { mapVolumeToBookRow } from "@/src/lib/books/map-volume-to-book-row";
import type { GoogleBooksVolume } from "@/src/lib/books/google-books/schemas";

function makeVolume(): GoogleBooksVolume {
  return {
    id: "google-volume-id",
    volumeInfo: {
      title: "The Left Hand of Darkness",
      authors: ["Ursula K. Le Guin"],
      description: "<p>A classic science fiction novel.</p>",
      categories: ["Fiction / Science Fiction"],
      mainCategory: "Fiction",
      pageCount: 304,
      publishedDate: "1969",
      imageLinks: {
        thumbnail: "http://books.google.com/thumb.jpg",
      },
      industryIdentifiers: [{ type: "ISBN_13", identifier: "978-0-441-47812-5" }],
      language: "en",
    },
  };
}

describe("mapVolumeToBookRow", () => {
  it("maps Google volume fields to books insert row", () => {
    const row = mapVolumeToBookRow(makeVolume());

    expect(row).toMatchObject({
      api_id: "google-volume-id",
      title: "The Left Hand of Darkness",
      author: "Ursula K. Le Guin",
      cover_url: "https://books.google.com/thumb.jpg",
      description: "A classic science fiction novel.",
      page_count: 304,
      published_date: "1969-01-01",
      isbn: "978-0-441-47812-5",
      language: "en",
    });
    expect(row.genres).toContain("Science Fiction");
    expect(row.tags).toBeNull();
  });
});
