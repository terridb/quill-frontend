"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { listKeys } from "@/src/hooks/list-keys";

async function deleteListRequest(listId: string): Promise<void> {
  const response = await fetch(`/api/lists/${listId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = (await response.json()) as { error?: string };
    throw new Error(data.error ?? "Unable to delete list");
  }
}

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteListRequest,
    onSuccess: (_data, listId) => {
      queryClient.removeQueries({ queryKey: listKeys.detail(listId) });
      void queryClient.invalidateQueries({ queryKey: listKeys.overview() });
      void queryClient.invalidateQueries({ queryKey: listKeys.all });
    },
  });
}
