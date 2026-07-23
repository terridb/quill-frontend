import { describe, expect, it } from "vitest";
import {
  dedupeRelatedBooks,
  mergeRelatedBooks,
} from "@/src/lib/books/merge-related-books";
import type { RelatedBook } from "@/src/types/book";

function book(
  bookId: string,
  title: string,
  authors = "Ali Hazelwood",
): RelatedBook {
  return { bookId, title, authors, coverUrl: null };
}

describe("dedupeRelatedBooks", () => {
  it("keeps the first edition of the same title and author", () => {
    expect(
      dedupeRelatedBooks([
        book("local-mate", "Mate"),
        book("google-mate", "Mate"),
        book("bride", "Bride"),
      ]).map((item) => item.bookId),
    ).toEqual(["local-mate", "bride"]);
  });
});

describe("mergeRelatedBooks", () => {
  it("does not add a Google edition when the catalog already has that work", () => {
    expect(
      mergeRelatedBooks(
        [book("UUdKEQAAQBAJ", "Mate"), book("bride", "Bride")],
        [book("other-mate-id", "Mate"), book("deep-end", "Deep End")],
        20,
      ).map((item) => item.bookId),
    ).toEqual(["UUdKEQAAQBAJ", "bride", "deep-end"]);
  });
});
