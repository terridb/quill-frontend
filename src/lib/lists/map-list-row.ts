import type { List, ListEntry } from "@/src/types/list";

export function mapListRow(data: {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  is_private: boolean;
  created_at: string;
}): List {
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    description: data.description,
    isDefault: data.is_default,
    isPrivate: data.is_private,
    createdAt: data.created_at,
  };
}

export function mapListEntryRow(data: {
  id: string;
  list_id: string;
  api_id: string;
  current_page: number | null;
  started_at: string | null;
  finished_at: string | null;
  added_at: string;
}): ListEntry {
  return {
    id: data.id,
    listId: data.list_id,
    apiId: data.api_id,
    currentPage: data.current_page,
    startedAt: data.started_at,
    finishedAt: data.finished_at,
    addedAt: data.added_at,
  };
}
