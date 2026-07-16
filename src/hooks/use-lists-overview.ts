"use client";

import { useQuery } from "@tanstack/react-query";
import { listKeys } from "@/src/hooks/list-keys";
import type { ListsOverview } from "@/src/types/list";

async function fetchListsOverview(): Promise<ListsOverview> {
  const response = await fetch("/api/lists/overview");

  if (!response.ok) {
    throw new Error("Unable to load lists");
  }

  return (await response.json()) as ListsOverview;
}

export function useListsOverview(initialData?: ListsOverview) {
  return useQuery({
    queryKey: listKeys.overview(),
    queryFn: fetchListsOverview,
    initialData,
    staleTime: 60_000,
  });
}
