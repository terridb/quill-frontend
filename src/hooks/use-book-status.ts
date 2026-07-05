"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookKeys } from "@/src/hooks/book-keys";
import type { ReadingStatus } from "@/src/types/open-library";

async function fetchBookStatus(
  _openLibraryId: string,
): Promise<ReadingStatus | null> {
  return null;
}

async function updateBookStatus(
  _openLibraryId: string,
  _status: ReadingStatus,
): Promise<ReadingStatus> {
  return _status;
}

export function useBookStatus(openLibraryId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: bookKeys.status(openLibraryId),
    queryFn: () => fetchBookStatus(openLibraryId),
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: (status: ReadingStatus) =>
      updateBookStatus(openLibraryId, status),
    onSuccess: (status) => {
      queryClient.setQueryData(bookKeys.status(openLibraryId), status);
    },
  });

  return {
    status: query.data ?? ("want_to_read" as ReadingStatus),
    isLoading: query.isLoading,
    setStatus: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}
