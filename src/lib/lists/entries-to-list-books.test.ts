import { describe, expect, it } from "vitest";
import { entriesToListBooks } from "@/src/lib/lists/entries-to-list-books";
import type { ListEntryWithBook } from "@/src/types/list";

describe("entriesToListBooks", () => {
  it("maps joined list entries to list books using api ids", async () => {
    const entries: ListEntryWithBook[] = [
      {
        id: "entry-1",
        listId: "list-1",
        bookId: "book-uuid-1",
        currentPage: null,
        startedAt: null,
        finishedAt: null,
        addedAt: "2026-01-01T00:00:00.000Z",
        apiId: "google-id-1",
        title: "Dune",
        authors: "Frank Herbert",
        coverUrl: "https://example.com/dune.jpg",
      },
    ];

    await expect(entriesToListBooks(entries)).resolves.toEqual([
      {
        entryId: "entry-1",
        addedAt: "2026-01-01T00:00:00.000Z",
        bookId: "google-id-1",
        title: "Dune",
        authors: "Frank Herbert",
        coverUrl: "https://example.com/dune.jpg",
      },
    ]);
  });
});
