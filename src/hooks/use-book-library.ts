"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookKeys } from "@/src/hooks/book-keys";
import { listKeys } from "@/src/hooks/list-keys";
import type {
  BookLibraryState,
  UpdateBookLibraryInput,
} from "@/src/types/book-library";

async function fetchBookLibrary(bookId: string): Promise<BookLibraryState> {
  const response = await fetch(`/api/books/${bookId}/library`);

  if (!response.ok) {
    throw new Error("Unable to load library");
  }

  return (await response.json()) as BookLibraryState;
}

async function updateBookLibraryRequest(
  bookId: string,
  input: UpdateBookLibraryInput,
): Promise<BookLibraryState> {
  const response = await fetch(`/api/books/${bookId}/library`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = (await response.json()) as { error?: string };
    throw new Error(data.error ?? "Unable to update library");
  }

  return (await response.json()) as BookLibraryState;
}

export function useBookLibrary(bookId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: bookKeys.library(bookId),
    queryFn: () => fetchBookLibrary(bookId),
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: (input: UpdateBookLibraryInput) =>
      updateBookLibraryRequest(bookId, input),
    onSuccess: (library) => {
      queryClient.setQueryData(bookKeys.library(bookId), library);
      void queryClient.invalidateQueries({ queryKey: listKeys.overview() });
      void queryClient.invalidateQueries({ queryKey: listKeys.all });
    },
  });

  const library = query.data;
  const isInLibrary = Boolean(
    library &&
      (library.readingStatus !== null || library.customListIds.length > 0),
  );

  return {
    library,
    isLoading: query.isLoading,
    isError: query.isError,
    isInLibrary,
    saveLibrary: mutation.mutateAsync,
    isSaving: mutation.isPending,
    saveError: mutation.error,
  };
}
