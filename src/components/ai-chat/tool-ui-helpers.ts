import { isReservedDefaultListName } from "@/src/lib/ai/mutable-list-guard";

type ApprovalInput = Record<string, unknown>;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

/** Returns a reason when a pending write must be auto-denied (e.g. reserved list names). */
export function getForbiddenApprovalReason(
  toolName: string,
  input: ApprovalInput,
): string | null {
  if (toolName !== "create_custom_list") {
    return null;
  }

  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name || !isReservedDefaultListName(name)) {
    return null;
  }

  return `“${name}” is a built-in shelf and cannot be created by Quill. Manage Currently Reading, Finished, and Did Not Finish in the app.`;
}

export function getToolApprovalCopy(
  toolName: string,
  input: ApprovalInput,
): { title: string; description: string } {
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
      const count = asStringArray(input.apiIds).length;
      return {
        title: "Add books to list",
        description: `Add ${count} book${count === 1 ? "" : "s"} to this list.`,
      };
    }
    case "remove_books_from_list": {
      const count = asStringArray(input.apiIds).length;
      return {
        title: "Remove books from list",
        description: `Remove ${count} book${count === 1 ? "" : "s"} from this list.`,
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
