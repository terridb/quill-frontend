"use client";

import { useId, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { listKeys } from "@/src/hooks/list-keys";
import { readingKeys } from "@/src/hooks/reading-keys";
import {
  useProgressInputMode,
  type ProgressInputMode,
} from "@/src/hooks/use-progress-input-mode";
import { useUpdateReadingProgress } from "@/src/hooks/use-update-reading-progress";
import { formatLocalDate } from "@/src/lib/reading/format-local-date";
import { getWeekRange } from "@/src/lib/reading/get-week-range";
import type { TrackerBook } from "@/src/types/reading-tracker";

export interface TrackerProgressPanelProps {
  book: TrackerBook;
  onSaved: () => void;
  onCancel: () => void;
}

async function updateBookStatus(
  bookId: string,
  readingStatus: "finished" | "did_not_finish",
): Promise<void> {
  const response = await fetch(`/api/books/${bookId}/library`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      readingStatus,
      customListIds: [],
    }),
  });

  if (!response.ok) {
    const data = (await response.json()) as { error?: string };
    throw new Error(data.error ?? "Unable to update status");
  }
}

function parseProgressSubmission(
  mode: ProgressInputMode,
  progressValue: string,
  totalPagesValue: string,
  book: TrackerBook,
): { currentPage: number; pageCount?: number } | null {
  const progress = Number(progressValue.trim());
  if (!Number.isFinite(progress) || progress < 0) {
    return null;
  }

  if (mode === "percent") {
    if (progress > 100) {
      return null;
    }

    const total = book.pageCount ?? 100;
    return {
      currentPage: Math.min(total, Math.round((progress / 100) * total)),
      pageCount: book.pageCount === null ? 100 : undefined,
    };
  }

  const totalPages = Number(totalPagesValue.trim());
  if (!Number.isFinite(totalPages) || totalPages < 1) {
    return null;
  }

  if (progress > totalPages) {
    return null;
  }

  return {
    currentPage: Math.round(progress),
    pageCount: Math.round(totalPages),
  };
}

export function TrackerProgressPanel({
  book,
  onSaved,
  onCancel,
}: TrackerProgressPanelProps) {
  const panelId = useId();
  const [mode, setMode] = useProgressInputMode();
  const [progressValue, setProgressValue] = useState("");
  const [totalPagesValue, setTotalPagesValue] = useState(
    book.pageCount !== null ? String(book.pageCount) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const updateProgress = useUpdateReadingProgress();
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (readingStatus: "finished" | "did_not_finish") =>
      updateBookStatus(book.bookId, readingStatus),
    onSuccess: () => {
      const { weekStart } = getWeekRange();
      const today = formatLocalDate(new Date());
      void queryClient.invalidateQueries({
        queryKey: readingKeys.tracker(weekStart, today),
      });
      void queryClient.invalidateQueries({ queryKey: readingKeys.all });
      void queryClient.invalidateQueries({ queryKey: listKeys.currentlyReading() });
      void queryClient.invalidateQueries({ queryKey: listKeys.overview() });
      onSaved();
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to update status",
      );
    },
  });

  const handleSave = async () => {
    setError(null);
    const parsed = parseProgressSubmission(
      mode,
      progressValue,
      totalPagesValue,
      book,
    );

    if (!parsed) {
      setError(
        mode === "percent"
          ? "Enter a valid percentage between 0 and 100"
          : "Enter your current page and the total pages in your edition",
      );
      return;
    }

    try {
      await updateProgress.mutateAsync({
        entryId: book.entryId,
        currentPage: parsed.currentPage,
        pageCount: parsed.pageCount,
      });
      setProgressValue("");
      onSaved();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save progress",
      );
    }
  };

  const isBusy = updateProgress.isPending || statusMutation.isPending;

  return (
    <form
      id={panelId}
      className="reading-progress-panel"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSave();
      }}
    >
      <div className="reading-progress-panel__toolbar">
        <div
          className="reading-mode-toggle"
          role="group"
          aria-label="Progress input type"
        >
          {(["pages", "percent"] as const).map((option) => (
            <button
              key={option}
              type="button"
              className={`focus-ring reading-mode-toggle__btn${
                mode === option ? " reading-mode-toggle__btn--active" : ""
              }`}
              aria-pressed={mode === option}
              onClick={() => setMode(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={isBusy}
          className="focus-ring reading-progress-panel__cancel"
        >
          Cancel
        </button>
      </div>

      <div
        className={`reading-progress-panel__fields${
          mode === "pages" ? " reading-progress-panel__fields--pages" : ""
        }`}
      >
        <div>
          <label
            htmlFor={`${panelId}-progress`}
            className="reading-progress-panel__label"
          >
            {mode === "percent" ? "Percent" : "Current page"}
          </label>
          <input
            id={`${panelId}-progress`}
            type="number"
            inputMode="numeric"
            min={0}
            max={mode === "percent" ? 100 : undefined}
            autoFocus
            placeholder={
              mode === "percent"
                ? book.progressPercent !== null
                  ? String(book.progressPercent)
                  : "0"
                : book.currentPage !== null
                  ? String(book.currentPage)
                  : "0"
            }
            value={progressValue}
            onChange={(event) => setProgressValue(event.target.value)}
            className="focus-ring reading-progress-panel__input input-surface"
          />
        </div>

        {mode === "pages" ? (
          <div>
            <label
              htmlFor={`${panelId}-total`}
              className="reading-progress-panel__label"
            >
              Total pages
            </label>
            <input
              id={`${panelId}-total`}
              type="number"
              inputMode="numeric"
              min={1}
              placeholder={
                book.pageCount !== null ? String(book.pageCount) : "Edition total"
              }
              value={totalPagesValue}
              onChange={(event) => setTotalPagesValue(event.target.value)}
              className="focus-ring reading-progress-panel__input input-surface"
            />
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="reading-progress-panel__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="reading-progress-panel__actions">
        <button
          type="submit"
          disabled={isBusy}
          className="focus-ring reading-tracker-cta"
        >
          {updateProgress.isPending ? "Saving…" : "Save progress"}
        </button>
        <div className="reading-progress-panel__secondary">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => statusMutation.mutate("did_not_finish")}
            className="focus-ring reading-progress-btn-secondary"
          >
            Did not finish
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => statusMutation.mutate("finished")}
            className="focus-ring reading-progress-btn-secondary"
          >
            Finished
          </button>
        </div>
      </div>
    </form>
  );
}
