"use client";

import { useQuery } from "@tanstack/react-query";
import { listKeys } from "@/src/hooks/list-keys";
import type { CurrentlyReadingBook } from "@/src/types/list";

interface CurrentlyReadingResponse {
  books: CurrentlyReadingBook[];
}

async function fetchCurrentlyReading(): Promise<CurrentlyReadingBook[]> {
  const response = await fetch("/api/lists/currently-reading");

  if (!response.ok) {
    throw new Error("Unable to load currently reading list");
  }

  const data = (await response.json()) as CurrentlyReadingResponse;
  return data.books;
}

export function useCurrentlyReading(initialData?: CurrentlyReadingBook[]) {
  return useQuery({
    queryKey: listKeys.currentlyReading(),
    queryFn: fetchCurrentlyReading,
    initialData,
    staleTime: 60_000,
  });
}
