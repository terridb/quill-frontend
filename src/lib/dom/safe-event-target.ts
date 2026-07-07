function isNodeLike(value: unknown): value is Node {
  return (
    typeof value === "object" &&
    value !== null &&
    "nodeType" in value &&
    typeof (value as Node).nodeType === "number"
  );
}

function isNodeAccessible(node: Node): boolean {
  void node.nodeType;

  const element = node as Element & { correspondingUseElement?: Element | null };
  if (element.correspondingUseElement) {
    void element.correspondingUseElement.nodeType;
  }

  return true;
}

export function getSafeEventTarget(event: Event): Node | null {
  try {
    if (typeof event.composedPath === "function") {
      const path = event.composedPath();
      const node = path[0];
      if (isNodeLike(node)) {
        return node;
      }
    }

    const target = event.target;
    if (isNodeLike(target)) {
      return target;
    }
  } catch {
    // Firefox blocks property access on extension-injected nodes.
  }

  return null;
}

export function isEventTargetAccessible(event: Event): boolean {
  try {
    const target = getSafeEventTarget(event);
    if (!target) {
      return false;
    }

    return isNodeAccessible(target);
  } catch {
    return false;
  }
}

export function isOutsideElement(container: Node, event: Event): boolean {
  const target = getSafeEventTarget(event);
  if (!target) {
    return false;
  }

  try {
    return !container.contains(target);
  } catch {
    return false;
  }
}
