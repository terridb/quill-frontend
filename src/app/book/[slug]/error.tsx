"use client";

import { ErrorState } from "@/src/components/ui/ErrorState";

export interface BookErrorProps {
  reset: () => void;
}

export default function BookError({ reset }: BookErrorProps) {
  return (
    <ErrorState
      title="Could not load this book"
      message="Book data may be unavailable. Check your connection and try again."
      onRetry={reset}
    />
  );
}
