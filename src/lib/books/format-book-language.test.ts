import { describe, expect, it } from "vitest";
import { formatBookLanguage } from "@/src/lib/books/format-book-language";

describe("formatBookLanguage", () => {
  it("returns null for empty values", () => {
    expect(formatBookLanguage(null)).toBeNull();
    expect(formatBookLanguage("")).toBeNull();
    expect(formatBookLanguage("   ")).toBeNull();
  });

  it("formats iso codes as english language names", () => {
    expect(formatBookLanguage("en")).toBe("English");
    expect(formatBookLanguage("nl")).toBe("Dutch");
    expect(formatBookLanguage("fr")).toBe("French");
  });

  it("normalizes regional codes to the primary language", () => {
    expect(formatBookLanguage("en-GB")).toBe("English");
  });

  it("falls back to uppercase code when the label is unavailable", () => {
    expect(formatBookLanguage("xx")).toBe("XX");
  });
});
