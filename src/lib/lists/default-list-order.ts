export const DEFAULT_LIST_NAMES = [
  "Want To Read",
  "Currently Reading",
  "Finished",
  "Did Not Finish",
] as const;

export type DefaultListName = (typeof DEFAULT_LIST_NAMES)[number];
