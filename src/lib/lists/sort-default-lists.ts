import { DEFAULT_LIST_NAMES } from "@/src/lib/lists/default-list-order";
import type { List } from "@/src/types/list";

export function sortDefaultLists(lists: List[]): List[] {
  const order = new Map(DEFAULT_LIST_NAMES.map((name, index) => [name, index]));

  return lists.toSorted((a, b) => {
    const aIndex = order.get(a.name as (typeof DEFAULT_LIST_NAMES)[number]) ?? 999;
    const bIndex = order.get(b.name as (typeof DEFAULT_LIST_NAMES)[number]) ?? 999;
    return aIndex - bIndex;
  });
}
