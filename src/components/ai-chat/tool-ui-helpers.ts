import { isToolUIPart, getToolName, type UIMessage } from "ai";
import { isReservedDefaultListName } from "@/src/lib/ai/mutable-list-guard";
import { isValidFinishedDate } from "@/src/lib/books/set-reading-status";
import type { ChatBookMention } from "@/src/components/ai-chat/ChatMessageText";

type ApprovalInput = Record<string, unknown>;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as Record<string, unknown>;
}

/** Returns a reason when a pending write must be auto-denied. */
export function getForbiddenApprovalReason(
  toolName: string,
  input: ApprovalInput,
): string | null {
  if (toolName === "create_custom_list") {
    const name = typeof input.name === "string" ? input.name.trim() : "";
    if (name && isReservedDefaultListName(name)) {
      return `“${name}” is a built-in shelf and cannot be created by Quill. Use Want To Read via add, or set_reading_status for Currently Reading / Finished.`;
    }
    return null;
  }

  if (toolName === "set_reading_status" && input.readingStatus === "finished") {
    const finishedAt =
      typeof input.finishedAt === "string" ? input.finishedAt.trim() : "";
    if (!isValidFinishedDate(finishedAt)) {
      return "A finish date is required before marking a book Finished. Tell Quill the date you finished it.";
    }
  }

  return null;
}

export function getToolApprovalCopy(
  toolName: string,
  input: ApprovalInput,
  options?: {
    books?: ChatBookMention[];
    listName?: string | null;
    bookCount?: number;
  },
): { title: string; description: string } {
  const listName = options?.listName?.trim() || null;
  const books = options?.books ?? [];
  const count =
    options?.bookCount ??
    (books.length > 0
      ? books.length
      : asStringArray(input.apiIds).length ||
        (typeof input.apiId === "string" ? 1 : 0));

  switch (toolName) {
    case "create_custom_list": {
      const name = typeof input.name === "string" ? input.name : "Untitled";
      const isPrivate = Boolean(input.isPrivate);
      return {
        title: "Create list",
        description: `Create “${name}”${isPrivate ? " (private)" : ""}.`,
      };
    }
    case "add_books_to_list": {
      const shelf = listName ? `“${listName}”` : "this list";
      if (books.length === 1) {
        return {
          title: "Add to list",
          description: `Add “${books[0]!.title}” to ${shelf}.`,
        };
      }
      return {
        title: "Add to list",
        description: `Add ${count} book${count === 1 ? "" : "s"} to ${shelf}.`,
      };
    }
    case "remove_books_from_list": {
      const shelf = listName ? `“${listName}”` : "this list";
      if (books.length === 1) {
        return {
          title: "Remove from list",
          description: `Remove “${books[0]!.title}” from ${shelf}.`,
        };
      }
      return {
        title: "Remove from list",
        description: `Remove ${count} book${count === 1 ? "" : "s"} from ${shelf}.`,
      };
    }
    case "set_reading_status": {
      const title =
        books.length === 1 ? `“${books[0]!.title}”` : "this book";
      const finishedAt =
        typeof input.finishedAt === "string" ? input.finishedAt.trim() : "";

      if (input.readingStatus === "finished") {
        return {
          title: "Mark finished",
          description: finishedAt
            ? `Move ${title} to Finished (finished ${finishedAt}).`
            : `Move ${title} to Finished.`,
        };
      }

      return {
        title: "Start reading",
        description: `Move ${title} to Currently Reading.`,
      };
    }
    default:
      return {
        title: "Confirm action",
        description: "Allow Quill to make this change?",
      };
  }
}

export function extractBookMentions(output: unknown): Array<{
  apiId: string;
  title: string;
  authors: string;
  coverUrl: string | null;
  description: string | null;
}> {
  if (!output || typeof output !== "object") {
    return [];
  }

  const record = output as Record<string, unknown>;

  if (typeof record.apiId === "string" && typeof record.title === "string") {
    return [
      {
        apiId: record.apiId,
        title: record.title,
        authors:
          typeof record.authors === "string" ? record.authors : "Unknown author",
        coverUrl: typeof record.coverUrl === "string" ? record.coverUrl : null,
        description:
          typeof record.description === "string" ? record.description : null,
      },
    ];
  }

  // Only catalog search hits — never walk library `lists` / shelf `books` dumps.
  const results = record.results;
  if (Array.isArray(results)) {
    return results.flatMap((item) => extractBookMentions(item));
  }

  return [];
}

/** Prefer later detail covers/descriptions when the same apiId appears twice. */
export function mergeBookMentions(
  books: ChatBookMention[],
): ChatBookMention[] {
  const byApiId = new Map<string, ChatBookMention>();

  for (const book of books) {
    const existing = byApiId.get(book.apiId);
    if (!existing) {
      byApiId.set(book.apiId, book);
      continue;
    }
    byApiId.set(book.apiId, {
      apiId: book.apiId,
      title: book.title || existing.title,
      authors: book.authors || existing.authors,
      coverUrl: book.coverUrl ?? existing.coverUrl,
      description: book.description ?? existing.description,
    });
  }

  return [...byApiId.values()];
}

/** Catalog books from search/detail tool outputs across the conversation. */
export function collectConversationBooks(
  messages: UIMessage[],
): ChatBookMention[] {
  const collected: ChatBookMention[] = [];

  for (const message of messages) {
    for (const part of message.parts) {
      if (!isToolUIPart(part) || part.state !== "output-available") {
        continue;
      }
      const toolName = getToolName(part);
      if (toolName !== "search_books" && toolName !== "get_book_details") {
        continue;
      }
      collected.push(...extractBookMentions(part.output));
    }
  }

  return mergeBookMentions(collected);
}

/** Map listId → name from library / list tool outputs in the conversation. */
export function collectConversationListNames(
  messages: UIMessage[],
): Map<string, string> {
  const names = new Map<string, string>();

  for (const message of messages) {
    for (const part of message.parts) {
      if (!isToolUIPart(part) || part.state !== "output-available") {
        continue;
      }

      const output = asRecord(part.output);
      if (!output) {
        continue;
      }

      if (
        typeof output.listId === "string" &&
        typeof output.listName === "string"
      ) {
        names.set(output.listId, output.listName);
      }

      const lists = output.lists;
      if (Array.isArray(lists)) {
        for (const item of lists) {
          const list = asRecord(item);
          if (
            list &&
            typeof list.id === "string" &&
            typeof list.name === "string"
          ) {
            names.set(list.id, list.name);
          }
        }
      }
    }
  }

  return names;
}

export function resolveBooksForApiIds(
  apiIds: string[],
  catalog: ChatBookMention[],
): ChatBookMention[] {
  const byApiId = new Map(catalog.map((book) => [book.apiId, book]));
  const seen = new Set<string>();
  const resolved: ChatBookMention[] = [];

  for (const apiId of apiIds) {
    if (seen.has(apiId)) {
      continue;
    }
    seen.add(apiId);
    const book = byApiId.get(apiId);
    if (book) {
      resolved.push(book);
    }
  }

  return resolved;
}

export type PendingApprovalGroup = {
  toolName: string;
  approvalIds: string[];
  input: ApprovalInput;
  apiIds: string[];
  listId: string | null;
};

/**
 * Collapse same-tool / same-list approvals into one UI group so
 * “add all of these” never becomes N confirm cards when the model splits calls.
 */
export function groupPendingApprovals(
  message: UIMessage,
): PendingApprovalGroup[] {
  const groups: PendingApprovalGroup[] = [];

  for (const part of message.parts) {
    if (
      !isToolUIPart(part) ||
      part.state !== "approval-requested" ||
      !part.approval
    ) {
      continue;
    }

    const toolName = getToolName(part);
    const input =
      part.input && typeof part.input === "object"
        ? (part.input as ApprovalInput)
        : {};
    const listId = typeof input.listId === "string" ? input.listId : null;
    const apiIds = asStringArray(input.apiIds);
    if (typeof input.apiId === "string" && input.apiId.trim()) {
      apiIds.push(input.apiId.trim());
    }

    const mergeable =
      (toolName === "add_books_to_list" ||
        toolName === "remove_books_from_list") &&
      listId !== null;

    const existing = mergeable
      ? groups.find(
          (group) => group.toolName === toolName && group.listId === listId,
        )
      : undefined;

    if (existing) {
      existing.approvalIds.push(part.approval.id);
      for (const apiId of apiIds) {
        if (!existing.apiIds.includes(apiId)) {
          existing.apiIds.push(apiId);
        }
      }
      continue;
    }

    groups.push({
      toolName,
      approvalIds: [part.approval.id],
      input,
      apiIds,
      listId,
    });
  }

  return groups;
}

export function messageHasActiveLookup(message: UIMessage): boolean {
  return message.parts.some((part) => {
    if (!isToolUIPart(part)) {
      return false;
    }
    return (
      part.state === "input-streaming" ||
      part.state === "input-available" ||
      part.state === "approval-responded"
    );
  });
}
