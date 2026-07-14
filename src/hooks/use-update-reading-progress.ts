"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { listKeys } from "@/src/hooks/list-keys";
import { readingKeys } from "@/src/hooks/reading-keys";
import { formatLocalDate } from "@/src/lib/reading/format-local-date";
import { getWeekRange } from "@/src/lib/reading/get-week-range";

interface UpdateReadingProgressInput {
  entryId: string;
  currentPage: number;
  pageCount?: number;
  loggedDate?: string;
}

async function updateReadingProgressRequest(
  input: UpdateReadingProgressInput,
): Promise<void> {
  const response = await fetch(`/api/reading/entries/${input.entryId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      currentPage: input.currentPage,
      pageCount: input.pageCount,
      loggedDate: input.loggedDate ?? formatLocalDate(new Date()),
    }),
  });

  if (!response.ok) {
    const data = (await response.json()) as { error?: string };
    throw new Error(data.error ?? "Unable to update progress");
  }
}

export function useUpdateReadingProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReadingProgressRequest,
    onSuccess: () => {
      const { weekStart } = getWeekRange();
      const today = formatLocalDate(new Date());
      void queryClient.invalidateQueries({
        queryKey: readingKeys.tracker(weekStart, today),
      });
      void queryClient.invalidateQueries({ queryKey: readingKeys.all });
      void queryClient.invalidateQueries({ queryKey: listKeys.currentlyReading() });
      void queryClient.invalidateQueries({ queryKey: listKeys.overview() });
    },
  });
}
