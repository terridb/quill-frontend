import { readingStatusToListName } from "@/src/lib/lists/reading-status-map";
import type { List } from "@/src/types/list";

const WANT_TO_READ_NAME = readingStatusToListName("want_to_read");

/** Lists the assistant may add to or remove from (custom lists + Want To Read). */
export function isAiMutableList(list: List): boolean {
  if (!list.isDefault) {
    return true;
  }

  return list.name === WANT_TO_READ_NAME;
}

export function aiMutableListError(listName: string): string {
  return `The assistant cannot change "${listName}". It can only create custom lists and add or remove books on custom lists and Want To Read.`;
}
