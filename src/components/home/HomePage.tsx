"use client";

import Link from "next/link";
import { CurrentlyReadingTracker } from "@/src/components/reading/CurrentlyReadingTracker";
import { RecommendPromo } from "@/src/components/home/RecommendPromo";
import { useReadingTracker } from "@/src/hooks/use-reading-tracker";
import type { ReadingTrackerData } from "@/src/types/reading-tracker";

export interface HomePageProps {
  initialTracker: ReadingTrackerData;
}

export function HomePage({ initialTracker }: HomePageProps) {
  const { data: tracker } = useReadingTracker(initialTracker);
  const activeTracker = tracker ?? initialTracker;
  const hasBooks = activeTracker.books.length > 0;

  return (
    <div className="home-page">
      {hasBooks ? (
        <CurrentlyReadingTracker initialTracker={activeTracker} />
      ) : (
        <div className="flex min-h-[40vh] flex-col justify-center">
          <h1 className="text-display max-w-sm text-[2rem] leading-[1.12] tracking-tight text-[var(--color-ink)] md:text-[2.35rem]">
            Every book you read, in one place.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--color-ink-secondary)]">
            Find titles and authors, then track what you read.
          </p>
          <p className="text-label mt-8">
            Add books to your{" "}
            <Link
              href="/lists"
              className="focus-ring rounded-sm font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
            >
              Currently Reading
            </Link>{" "}
            list to start tracking.
          </p>
        </div>
      )}
      <RecommendPromo />
    </div>
  );
}
