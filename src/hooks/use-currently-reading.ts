"use client";

import { useQuery } from "@tanstack/react-query";
import { listKeys } from "@/src/hooks/list-keys";
import type { ListBook } from "@/src/types/list";

interface CurrentlyReadingResponse {
  listId: string | null;
  isPrivate: boolean;
  books: ListBook[];
}

async function fetchCurrentlyReading(): Promise<CurrentlyReadingResponse> {
  const response = await fetch("/api/lists/currently-reading");

  if (!response.ok) {
    throw new Error("Unable to load currently reading list");
  }

  return (await response.json()) as CurrentlyReadingResponse;
}

export function useCurrentlyReading(initialData?: CurrentlyReadingResponse) {
  return useQuery({
    queryKey: listKeys.currentlyReading(),
    queryFn: fetchCurrentlyReading,
    initialData,
    staleTime: 60_000,
  });
}
