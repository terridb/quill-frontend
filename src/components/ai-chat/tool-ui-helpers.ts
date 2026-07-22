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

type ToolActivityPhase = "active" | "done";

export type ToolActivityStatus = {
  label: string;
  active: boolean;
};

/**
 * Friendly otter asides for tool calls — curious, lightly funny, never technical.
 */
export function getToolActivityCopy(
  toolName: string,
  phase: ToolActivityPhase,
  input?: unknown,
): string {
  const record = asRecord(input);
  const query =
    typeof record?.query === "string" ? record.query.trim().toLowerCase() : "";

  switch (toolName) {
    case "get_user_library":
      return phase === "active"
        ? "Diving into your shelves — hold my fish…"
        : "Shook the water off. Nice shelves.";
    case "get_reading_activity":
      return phase === "active"
        ? "Following your recent ripples…"
        : "Caught up on where you’ve been swimming.";
    case "search_books": {
      if (phase === "active") {
        if (query.includes("inauthor:")) {
          return "Paddling after an author you like…";
        }
        if (query.includes("subject:") || query.includes("genre")) {
          return "Sniffing the catalog for that exact vibe…";
        }
        return "Belly-flopping into the catalog…";
      }
      return "Came up with a few pebbles in my paws.";
    }
    case "get_book_details":
      return phase === "active"
        ? "Pressing my nose to this spine…"
        : "Got a good long sniff of that one.";
    case "get_list_books":
      return phase === "active"
        ? "Flipping that pile with both paws…"
        : "Sorted that pile. Mostly.";
    case "find_book_on_shelves":
      return phase === "active"
        ? "Is this already nesting on your shelves…?"
        : "Checked the den for that title.";
    case "create_custom_list":
      return phase === "active"
        ? "Building you a little book nest…"
        : "New nest, ready for books.";
    case "add_books_to_list":
      return phase === "active"
        ? "Tucking books under my arm for your shelf…"
        : "Books delivered. I only chewed one corner.";
    case "remove_books_from_list":
      return phase === "active"
        ? "Gently nudging these off the shelf…"
        : "Cleared some space. No books were eaten.";
    case "set_reading_status":
      return phase === "active"
        ? "Moving this one to a new perch…"
        : "New perch secured.";
    default:
      return phase === "active"
        ? "Busy being a helpful otter…"
        : "Did a little otter errand.";
  }
}

function isActiveToolState(state: string): boolean {
  return (
    state === "input-streaming" ||
    state === "input-available" ||
    state === "approval-responded"
  );
}

/**
 * Single live status for the message: the in-progress tool, or the latest
 * finished step while Quill still has no reply text yet.
 */
export function getVisibleToolActivity(
  message: UIMessage,
): ToolActivityStatus | null {
  const hasReplyText = message.parts.some(
    (part) => part.type === "text" && part.text.trim().length > 0,
  );

  for (let i = message.parts.length - 1; i >= 0; i -= 1) {
    const part = message.parts[i];
    if (!isToolUIPart(part)) {
      continue;
    }
    if (isActiveToolState(part.state)) {
      return {
        label: getToolActivityCopy(
          getToolName(part),
          "active",
          part.input,
        ),
        active: true,
      };
    }
  }

  // Between steps (or before the first reply token): show only the latest done.
  if (hasReplyText) {
    return null;
  }

  for (let i = message.parts.length - 1; i >= 0; i -= 1) {
    const part = message.parts[i];
    if (!isToolUIPart(part) || part.state !== "output-available") {
      continue;
    }
    return {
      label: getToolActivityCopy(getToolName(part), "done", part.input),
      active: false,
    };
  }

  return null;
}
