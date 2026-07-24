import { describe, expect, it } from "vitest";
import { bookIdentityKey } from "@/src/lib/ai/book-identity";
import {
  authorNamesMatch,
  compactAuthorName,
  normalizeAuthorName,
} from "@/src/lib/books/normalize-author-name";

describe("normalizeAuthorName", () => {
  it("treats punctuation and spacing variants the same", () => {
    expect(normalizeAuthorName("J.K. Rowling")).toBe("j k rowling");
    expect(normalizeAuthorName("J. K. Rowling")).toBe("j k rowling");
    expect(normalizeAuthorName("Ali Hazelwood")).toBe("ali hazelwood");
  });
});

describe("authorNamesMatch", () => {
  it("matches initials variants without being author-specific", () => {
    expect(authorNamesMatch("C.S. Lewis", "C. S. Lewis")).toBe(true);
    expect(authorNamesMatch("C.S. Lewis", "CS Lewis")).toBe(true);
    expect(compactAuthorName("G.R.R. Martin")).toBe("grrmartin");
    expect(authorNamesMatch("G.R.R. Martin", "G. R. R. Martin")).toBe(true);
  });
});

describe("bookIdentityKey", () => {
  it("uses compact author keys so initial variants share an identity", () => {
    expect(
      bookIdentityKey("J.K. Rowling", "Harry Potter and the Half-Blood Prince"),
    ).toBe(
      bookIdentityKey("J. K. Rowling", "Harry Potter and the Half-Blood Prince"),
    );
    expect(bookIdentityKey("JK Rowling", "Mate")).toBe(
      bookIdentityKey("J. K. Rowling", "Mate"),
    );
  });
});
