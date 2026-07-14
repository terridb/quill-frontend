import {
  addDays,
  formatLocalDate,
  parseLocalDate,
} from "@/src/lib/reading/format-local-date";
import type { WeekDay } from "@/src/types/reading-tracker";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;
const WEEKDAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export interface WeekRange {
  weekStart: string;
  weekEnd: string;
  weekDays: WeekDay[];
}

export function getWeekRange(referenceDate: Date = new Date()): WeekRange {
  const date = new Date(referenceDate);
  const dayOfWeek = date.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(date);
  monday.setDate(date.getDate() - daysFromMonday);

  const weekStart = formatLocalDate(monday);
  const weekEnd = addDays(weekStart, 6);

  const weekDays: WeekDay[] = WEEKDAY_LABELS.map((label, index) => ({
    label,
    name: WEEKDAY_NAMES[index],
    date: addDays(weekStart, index),
    read: false,
  }));

  return { weekStart, weekEnd, weekDays };
}

export function buildWeekDays(
  weekStart: string,
  readDates: Set<string>,
): WeekDay[] {
  return WEEKDAY_LABELS.map((label, index) => {
    const date = addDays(weekStart, index);
    return {
      label,
      name: WEEKDAY_NAMES[index],
      date,
      read: readDates.has(date),
    };
  });
}

export function isDateInRange(
  date: string,
  rangeStart: string,
  rangeEnd: string,
): boolean {
  const value = parseLocalDate(date).getTime();
  return (
    value >= parseLocalDate(rangeStart).getTime() &&
    value <= parseLocalDate(rangeEnd).getTime()
  );
}
