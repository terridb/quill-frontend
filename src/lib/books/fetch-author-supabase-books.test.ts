import { describe, expect, it } from "vitest";
import { authorSearchToken } from "@/src/lib/books/fetch-author-supabase-books";

describe("authorSearchToken", () => {
  it("uses the last significant name part", () => {
    expect(authorSearchToken("Ali Hazelwood")).toBe("hazelwood");
    expect(authorSearchToken("J. K. Rowling")).toBe("rowling");
  });

  it("returns null for empty author names", () => {
    expect(authorSearchToken("   ")).toBeNull();
  });
});
