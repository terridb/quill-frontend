"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookKeys } from "@/src/hooks/book-keys";
import type { ReadingStatus } from "@/src/types/book";

async function fetchBookStatus(_bookId: string): Promise<ReadingStatus | null> {
  return null;
}

async function updateBookStatus(
  _bookId: string,
  _status: ReadingStatus,
): Promise<ReadingStatus> {
  return _status;
}

export function useBookStatus(bookId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: bookKeys.status(bookId),
    queryFn: () => fetchBookStatus(bookId),
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: (status: ReadingStatus) => updateBookStatus(bookId, status),
    onSuccess: (status) => {
      queryClient.setQueryData(bookKeys.status(bookId), status);
    },
  });

  return {
    status: query.data ?? ("want_to_read" as ReadingStatus),
    isLoading: query.isLoading,
    setStatus: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}
