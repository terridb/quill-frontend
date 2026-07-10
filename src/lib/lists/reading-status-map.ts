import { DEFAULT_LIST_NAMES } from "@/src/lib/lists/default-list-order";
import type { ReadingStatus } from "@/src/types/book";
import { READING_STATUS_LABELS } from "@/src/types/book";

const STATUS_ORDER: ReadingStatus[] = [
  "want_to_read",
  "currently_reading",
  "finished",
  "did_not_finish",
];

export const READING_STATUS_OPTIONS = STATUS_ORDER.map((status) => ({
  status,
  label: READING_STATUS_LABELS[status],
}));

const STATUS_TO_LIST_NAME: Record<ReadingStatus, (typeof DEFAULT_LIST_NAMES)[number]> = {
  want_to_read: "Want To Read",
  currently_reading: "Currently Reading",
  finished: "Finished",
  did_not_finish: "Did Not Finish",
};

const LIST_NAME_TO_STATUS = new Map(
  STATUS_ORDER.map((status) => [STATUS_TO_LIST_NAME[status], status] as const),
);

export function readingStatusToListName(
  status: ReadingStatus,
): (typeof DEFAULT_LIST_NAMES)[number] {
  return STATUS_TO_LIST_NAME[status];
}

export function listNameToReadingStatus(name: string): ReadingStatus | null {
  return LIST_NAME_TO_STATUS.get(name as (typeof DEFAULT_LIST_NAMES)[number]) ?? null;
}
