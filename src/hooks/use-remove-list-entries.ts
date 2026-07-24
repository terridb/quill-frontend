"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { listKeys } from "@/src/hooks/list-keys";
import type { ListDetail } from "@/src/types/list";

export interface RemoveListEntriesInput {
  listId: string;
  entryIds: string[];
}

interface RemoveListEntriesResponse {
  removedIds: string[];
}

async function removeListEntriesRequest({
  listId,
  entryIds,
}: RemoveListEntriesInput): Promise<RemoveListEntriesResponse> {
  const response = await fetch(`/api/lists/${listId}/entries`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entryIds }),
  });

  if (!response.ok) {
    const data = (await response.json()) as { error?: string };
    throw new Error(data.error ?? "Unable to remove books from list");
  }

  return (await response.json()) as RemoveListEntriesResponse;
}

export function useRemoveListEntries(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryIds: string[]) =>
      removeListEntriesRequest({ listId, entryIds }),
    onMutate: async (entryIds) => {
      await queryClient.cancelQueries({ queryKey: listKeys.detail(listId) });

      const previousDetail = queryClient.getQueryData<ListDetail>(
        listKeys.detail(listId),
      );

      if (previousDetail) {
        const removeSet = new Set(entryIds);
        queryClient.setQueryData<ListDetail>(listKeys.detail(listId), {
          ...previousDetail,
          books: previousDetail.books.filter(
            (book) => !removeSet.has(book.entryId),
          ),
        });
      }

      return { previousDetail };
    },
    onError: (_error, _entryIds, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          listKeys.detail(listId),
          context.previousDetail,
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: listKeys.detail(listId) });
      void queryClient.invalidateQueries({ queryKey: listKeys.overview() });
      void queryClient.invalidateQueries({
        queryKey: listKeys.currentlyReading(),
      });
    },
  });
}
