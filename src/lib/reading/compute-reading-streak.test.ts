import { describe, expect, it } from "vitest";
import { computeReadingStreak } from "@/src/lib/reading/compute-reading-streak";

describe("computeReadingStreak", () => {
  it("returns 0 when there are no logs", () => {
    expect(computeReadingStreak([], "2026-07-14")).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    expect(
      computeReadingStreak(
        ["2026-07-14", "2026-07-13", "2026-07-12", "2026-07-10"],
        "2026-07-14",
      ),
    ).toBe(3);
  });

  it("returns 0 when today has no log", () => {
    expect(computeReadingStreak(["2026-07-13", "2026-07-12"], "2026-07-14")).toBe(
      0,
    );
  });
});
