import { addDays } from "@/src/lib/reading/format-local-date";

export function computeReadingStreak(
  loggedDates: string[],
  today: string,
): number {
  const uniqueDates = new Set(loggedDates);
  let streak = 0;
  let cursor = today;

  while (uniqueDates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}
