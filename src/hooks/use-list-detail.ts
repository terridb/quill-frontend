"use client";

import { useQuery } from "@tanstack/react-query";
import { listKeys } from "@/src/hooks/list-keys";
import type { ListDetail } from "@/src/types/list";

async function fetchListDetail(id: string): Promise<ListDetail> {
  const response = await fetch(`/api/lists/${id}`);

  if (!response.ok) {
    throw new Error("Unable to load list");
  }

  return (await response.json()) as ListDetail;
}

export function useListDetail(id: string, initialData?: ListDetail) {
  return useQuery({
    queryKey: listKeys.detail(id),
    queryFn: () => fetchListDetail(id),
    initialData,
    staleTime: 60_000,
  });
}
