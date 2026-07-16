import { calculateShelfLayout } from "@/src/lib/lists/shelf-layout";
import { describe, expect, it } from "vitest";

describe("calculateShelfLayout", () => {
  it("keeps a single book at the fixed spine size", () => {
    const layout = calculateShelfLayout(640, 1);

    expect(layout.visibleCount).toBe(1);
    expect(layout.overflowCount).toBe(0);
    expect(layout.spineWidth).toBe(68);
  });

  it("shows all books at a fixed size when they fit", () => {
    const layout = calculateShelfLayout(320, 3);

    expect(layout.visibleCount).toBe(3);
    expect(layout.overflowCount).toBe(0);
    expect(layout.spineWidth).toBe(56);
  });

  it("fills the shelf with fixed-size books and an overflow slot", () => {
    const layout = calculateShelfLayout(320, 8);

    expect(layout.visibleCount).toBe(4);
    expect(layout.overflowCount).toBe(4);
    expect(layout.spineWidth).toBe(56);

    const slotCount = layout.visibleCount + 1;
    const totalWidth =
      slotCount * layout.spineWidth + (slotCount - 1) * layout.gap;

    expect(totalWidth).toBeLessThanOrEqual(320);
  });
});
