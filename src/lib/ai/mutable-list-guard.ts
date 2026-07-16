import { DEFAULT_LIST_NAMES } from "@/src/lib/lists/default-list-order";
import { readingStatusToListName } from "@/src/lib/lists/reading-status-map";
import type { List } from "@/src/types/list";

const WANT_TO_READ_NAME = readingStatusToListName("want_to_read");

function normalizeListName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

const RESERVED_LIST_NAMES = new Set(
  DEFAULT_LIST_NAMES.map((name) => normalizeListName(name)),
);

/** Lists the assistant may add to or remove from (custom lists + Want To Read). */
export function isAiMutableList(list: List): boolean {
  if (!list.isDefault) {
    return true;
  }

  return list.name === WANT_TO_READ_NAME;
}

/** Built-in shelf names must never be recreated as custom lists. */
export function isReservedDefaultListName(name: string): boolean {
  return RESERVED_LIST_NAMES.has(normalizeListName(name));
}

export function aiMutableListError(listName: string): string {
  return `The assistant cannot add or remove books on "${listName}" with list tools. Use set_reading_status to move books to Currently Reading or Finished. Did Not Finish must be managed by the user in the app.`;
}

export function reservedListNameError(name: string): string {
  return `Cannot create a list named "${name}". That name is reserved for a built-in shelf. Never create lists called Want To Read, Currently Reading, Finished, or Did Not Finish. Use add_books_to_list for Want To Read, set_reading_status for Currently Reading or Finished, or choose a different custom list name.`;
}
