"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { listKeys } from "@/src/hooks/list-keys";
import { readingKeys } from "@/src/hooks/reading-keys";
import { formatLocalDate } from "@/src/lib/reading/format-local-date";
import { getWeekRange } from "@/src/lib/reading/get-week-range";

interface LogReadingTodayInput {
  entryId: string;
  loggedDate?: string;
}

async function logReadingTodayRequest(input: LogReadingTodayInput): Promise<void> {
  const response = await fetch("/api/reading/log-today", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      entryId: input.entryId,
      loggedDate: input.loggedDate ?? formatLocalDate(new Date()),
    }),
  });

  if (!response.ok) {
    const data = (await response.json()) as { error?: string };
    throw new Error(data.error ?? "Unable to log reading");
  }
}

export function useLogReadingToday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logReadingTodayRequest,
    onSuccess: () => {
      const { weekStart } = getWeekRange();
      const today = formatLocalDate(new Date());
      void queryClient.invalidateQueries({
        queryKey: readingKeys.tracker(weekStart, today),
      });
      void queryClient.invalidateQueries({ queryKey: readingKeys.all });
      void queryClient.invalidateQueries({ queryKey: listKeys.currentlyReading() });
    },
  });
}
