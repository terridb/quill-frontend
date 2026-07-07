import { describe, expect, it } from "vitest";
import {
  getSafeEventTarget,
  isEventTargetAccessible,
  isOutsideElement,
} from "@/src/lib/dom/safe-event-target";

function createMockNode(nodeType = 1): Node {
  return { nodeType } as Node;
}

function createMockEvent({
  path,
  target,
}: {
  path?: Node[];
  target?: Node | null;
}): Event {
  return {
    composedPath() {
      if (path) {
        return path;
      }
      throw new Error("Permission denied to access property");
    },
    get target() {
      if (target !== undefined) {
        return target;
      }
      throw new Error("Permission denied to access property");
    },
  } as Event;
}

describe("safe-event-target", () => {
  it("returns composed path nodes when available", () => {
    const button = createMockNode();
    const event = createMockEvent({ path: [button] });

    expect(getSafeEventTarget(event)).toBe(button);
    expect(isEventTargetAccessible(event)).toBe(true);
  });

  it("detects outside clicks safely", () => {
    const container = createMockNode();
    const inside = createMockNode();
    const outside = createMockNode();

    Object.defineProperty(container, "contains", {
      value: (node: Node) => node === inside,
    });

    expect(
      isOutsideElement(container, createMockEvent({ path: [inside, container] })),
    ).toBe(false);
    expect(
      isOutsideElement(container, createMockEvent({ path: [outside] })),
    ).toBe(true);
  });

  it("returns false for inaccessible targets", () => {
    const event = createMockEvent({});

    expect(getSafeEventTarget(event)).toBeNull();
    expect(isEventTargetAccessible(event)).toBe(false);
  });
});
