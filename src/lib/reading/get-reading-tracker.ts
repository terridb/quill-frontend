import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { computeReadingStreak } from "@/src/lib/reading/compute-reading-streak";
import {
  getDistinctReadingDates,
  getReadingLogsInRange,
} from "@/src/lib/reading/get-reading-logs";
import { computeProgressPercent } from "@/src/lib/reading/progress-percent";
import { buildWeekDays } from "@/src/lib/reading/get-week-range";
import { getListByName } from "@/src/lib/lists/get-list-by-name";
import { mapListEntryRow } from "@/src/lib/lists/map-list-row";
import { createClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/types/database";
import type { ReadingTrackerData, TrackerBook } from "@/src/types/reading-tracker";

type TypedSupabaseClient = SupabaseClient<Database>;

const CURRENTLY_READING_LIST_NAME = "Currently Reading";

async function fetchCurrentlyReadingEntries(
  supabase: TypedSupabaseClient,
  userId: string,
) {
  const list = await getListByName(
    supabase,
    userId,
    CURRENTLY_READING_LIST_NAME,
  );

  if (!list) {
    return [];
  }

  const { data, error } = await supabase
    .from("list_entries")
    .select(
      `
      id,
      list_id,
      book_id,
      current_page,
      started_at,
      finished_at,
      added_at,
      books (
        api_id,
        title,
        author,
        cover_url,
        page_count
      )
    `,
    )
    .eq("list_id", list.id)
    .order("added_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data
    .map((row) => mapListEntryRow(row))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
}

async function getReadingTrackerUncached(
  userId: string,
  weekStart: string,
  weekEnd: string,
  today: string,
): Promise<ReadingTrackerData> {
  const supabase = await createClient();

  const [entries, weekLogs, allDates] = await Promise.all([
    fetchCurrentlyReadingEntries(supabase, userId),
    getReadingLogsInRange(supabase, userId, weekStart, weekEnd),
    getDistinctReadingDates(supabase, userId),
  ]);

  const readDatesInWeek = new Set(weekLogs.map((log) => log.loggedDate));
  const weekDays = buildWeekDays(weekStart, readDatesInWeek);
  const streak = computeReadingStreak(allDates, today);
  const readToday = allDates.includes(today);

  const todayLogsByEntry = new Map<string, number>();
  for (const log of weekLogs) {
    if (log.loggedDate === today) {
      todayLogsByEntry.set(log.listEntryId, log.pagesRead);
    }
  }

  const books: TrackerBook[] = entries.map((entry) => {
    const hasLogToday = todayLogsByEntry.has(entry.id);

    return {
      entryId: entry.id,
      bookId: entry.apiId,
      title: entry.title,
      authors: entry.authors,
      coverUrl: entry.coverUrl,
      currentPage: entry.currentPage,
      pageCount: entry.pageCount ?? null,
      progressPercent: computeProgressPercent(
        entry.currentPage,
        entry.pageCount ?? null,
      ),
      pagesReadToday: hasLogToday
        ? (todayLogsByEntry.get(entry.id) ?? 0)
        : null,
      readToday: hasLogToday,
    };
  });

  return {
    books,
    weekDays,
    streak,
    readToday,
  };
}

export const getReadingTracker = cache(getReadingTrackerUncached);
