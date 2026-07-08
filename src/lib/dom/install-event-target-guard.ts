import { isEventTargetAccessible } from "@/src/lib/dom/safe-event-target";

const GUARDED_EVENTS = [
  "click",
  "mousedown",
  "mouseup",
  "pointerdown",
  "pointerup",
] as const;

function guardInaccessibleEventTarget(event: Event) {
  if (!isEventTargetAccessible(event)) {
    event.stopImmediatePropagation();
  }
}

let guardInstalled = false;

export function installEventTargetGuard() {
  if (guardInstalled || typeof document === "undefined") {
    return;
  }

  guardInstalled = true;

  for (const type of GUARDED_EVENTS) {
    document.addEventListener(type, guardInaccessibleEventTarget, true);
  }
}
