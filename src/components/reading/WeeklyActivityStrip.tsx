"use client";

import { formatLocalDate } from "@/src/lib/reading/format-local-date";
import type { WeekDay } from "@/src/types/reading-tracker";

export interface WeeklyActivityStripProps {
  weekDays: WeekDay[];
}

export function WeeklyActivityStrip({ weekDays }: WeeklyActivityStripProps) {
  const today = formatLocalDate(new Date());

  return (
    <ol
      className="reading-week-strip"
      aria-label="Weekly reading activity"
    >
      {weekDays.map((day) => {
        const isToday = day.date === today;

        return (
          <li
            key={day.date}
            className={`reading-week-day${isToday ? " reading-week-day--today" : ""}`}
          >
            <span
              className={`reading-week-letter${isToday ? " reading-week-letter--today" : ""}`}
              aria-hidden="true"
            >
              {day.label}
            </span>
            <span
              className={`reading-week-pip${
                day.read ? " reading-week-pip--read" : ""
              }${isToday ? " reading-week-pip--today" : ""}`}
              aria-label={`${day.name}, ${day.read ? "read" : "not read"}`}
            />
          </li>
        );
      })}
    </ol>
  );
}
