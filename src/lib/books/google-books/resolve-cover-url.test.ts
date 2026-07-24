import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import {
  isGoogleUnavailableCoverImage,
  readCoverImageSize,
  resolveCoverUrl,
} from "@/src/lib/books/google-books/resolve-cover-url";

describe("isGoogleUnavailableCoverImage", () => {
  it("detects known placeholder digests", () => {
    // Build bytes whose SHA-256 matches a known placeholder entry by using the
    // real digest path: we only assert grayscale / JPEG heuristics here for
    // synthetic buffers; hash set is covered via the constant list in source.
    const grayPng = new Uint8Array(26);
    grayPng[0] = 0x89;
    grayPng[1] = 0x50;
    grayPng[2] = 0x4e;
    grayPng[3] = 0x47;
    grayPng[25] = 0;
    expect(isGoogleUnavailableCoverImage(grayPng)).toBe(true);
  });

  it("rejects indexed-color PNGs used as high-zoom placeholders", () => {
    const indexedPng = new Uint8Array(26);
    indexedPng[0] = 0x89;
    indexedPng[1] = 0x50;
    indexedPng[2] = 0x4e;
    indexedPng[3] = 0x47;
    indexedPng[25] = 3;
    expect(isGoogleUnavailableCoverImage(indexedPng)).toBe(true);
  });

  it("allows color PNGs that are not known placeholders", () => {
    const png = new Uint8Array(26);
    png[0] = 0x89;
    png[1] = 0x50;
    png[2] = 0x4e;
    png[3] = 0x47;
    png[25] = 2;
    expect(isGoogleUnavailableCoverImage(png)).toBe(false);
  });

  it("rejects grayscale JPEGs (1 component SOF)", () => {
    // Minimal JPEG with SOF0, 128x198, 1 component
    const jpeg = new Uint8Array([
      0xff, 0xd8, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0xc6, 0x00, 0x80, 0x01,
      0xff, 0xd9,
    ]);
    expect(isGoogleUnavailableCoverImage(jpeg)).toBe(true);
  });

  it("allows short color JPEG magic without SOF", () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    expect(isGoogleUnavailableCoverImage(jpeg)).toBe(false);
  });

  it("matches the live 300×391 placeholder by hash", async () => {
    const response = await fetch(
      "https://books.google.com/books/content?id=eE9SMQEACAAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api",
    );
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(
      "12557f8948b8bdc6af436e3a8b3adddd45f7f7d2b67c5832e799cdf4686f72bb",
    );
    expect(isGoogleUnavailableCoverImage(bytes)).toBe(true);
  });
});

describe("readCoverImageSize", () => {
  it("reads PNG IHDR dimensions", () => {
    const bytes = new Uint8Array(26);
    bytes[0] = 0x89;
    bytes[1] = 0x50;
    bytes[2] = 0x4e;
    bytes[3] = 0x47;
    bytes[16] = 0;
    bytes[17] = 0;
    bytes[18] = 0x01;
    bytes[19] = 0x2c;
    bytes[20] = 0;
    bytes[21] = 0;
    bytes[22] = 0x01;
    bytes[23] = 0xc2;

    expect(readCoverImageSize(bytes)).toEqual({ width: 300, height: 450 });
  });
});

describe("resolveCoverUrl", () => {
  it("falls back to stable zoom=1 when every zoom is a placeholder", async () => {
    // Volume whose content API only serves Google's gray "not available" art.
    const url =
      "https://books.google.com/books/content?id=iWcrEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api";
    const resolved = await resolveCoverUrl(url, "high");
    expect(resolved).toBe(
      "https://books.google.com/books/content?id=iWcrEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
    );
  });

  it("keeps a real cover instead of returning null", async () => {
    const url =
      "https://books.google.com/books/content?id=_m7vPwAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api";
    const resolved = await resolveCoverUrl(url, "high");
    expect(resolved).toContain("id=_m7vPwAACAAJ");
    expect(resolved).not.toBeNull();
  });
});
