"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { listKeys } from "@/src/hooks/list-keys";
import type { List } from "@/src/types/list";

export interface CreateListInput {
  name: string;
  isPrivate: boolean;
}

interface CreateListResponse {
  list: List;
}

async function createListRequest(input: CreateListInput): Promise<List> {
  const response = await fetch("/api/lists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = (await response.json()) as { error?: string };
    throw new Error(data.error ?? "Unable to create list");
  }

  const data = (await response.json()) as CreateListResponse;
  return data.list;
}

export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createListRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listKeys.overview() });
    },
  });
}
