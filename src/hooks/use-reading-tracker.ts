"use client";

import { useQuery } from "@tanstack/react-query";
import { readingKeys } from "@/src/hooks/reading-keys";
import { formatLocalDate } from "@/src/lib/reading/format-local-date";
import { getWeekRange } from "@/src/lib/reading/get-week-range";
import type { ReadingTrackerData } from "@/src/types/reading-tracker";

interface TrackerQueryParams {
  weekStart: string;
  weekEnd: string;
  today: string;
}

function getTrackerParams(referenceDate = new Date()): TrackerQueryParams {
  const { weekStart, weekEnd } = getWeekRange(referenceDate);
  return {
    weekStart,
    weekEnd,
    today: formatLocalDate(referenceDate),
  };
}

async function fetchReadingTracker(
  params: TrackerQueryParams,
): Promise<ReadingTrackerData> {
  const search = new URLSearchParams({
    weekStart: params.weekStart,
    weekEnd: params.weekEnd,
    today: params.today,
  });

  const response = await fetch(`/api/reading/tracker?${search.toString()}`);

  if (!response.ok) {
    throw new Error("Unable to load reading tracker");
  }

  return (await response.json()) as ReadingTrackerData;
}

export function useReadingTracker(initialData?: ReadingTrackerData) {
  const params = getTrackerParams();

  return useQuery({
    queryKey: readingKeys.tracker(params.weekStart, params.today),
    queryFn: () => fetchReadingTracker(params),
    initialData,
    staleTime: 30_000,
  });
}

export function useReadingTrackerParams() {
  return getTrackerParams();
}
