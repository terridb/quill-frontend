import type { ButtonHTMLAttributes } from "react";

/**
 * Spread onto `<button>` so Firefox does not restore `disabled` across reloads
 * (https://bugzilla.mozilla.org/show_bug.cgi?id=654072). React's button types omit
 * `autoComplete`; the attribute is intentional and Firefox-specific.
 */
export const firefoxButtonNoPersistProps = {
  autoComplete: "off",
} as ButtonHTMLAttributes<HTMLButtonElement>;
