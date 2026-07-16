import {
  isToolUIPart,
  getToolName,
  type UIMessage,
} from "ai";
import { normalizeBookTitle } from "@/src/lib/ai/book-identity";

function messageText(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text",
    )
    .map((part) => part.text)
    .join("\n");
}

function extractItemTitle(itemText: string): string {
  const bold = itemText.match(/\*\*([^*]+)\*\*/);
  if (bold?.[1]) {
    return bold[1].trim();
  }
  const bySplit = itemText.split(/\s+by\s+/i)[0];
  return (bySplit ?? itemText).replace(/^[*_]+|[*_]+$/g, "").trim();
}

/** Titles from a numbered recommendation list (1. **Title** by Author — …). */
export function extractRecommendationTitles(text: string): string[] {
  const titles: string[] = [];
  for (const line of text.split("\n")) {
    const match = line.trim().match(/^\d+\.\s+(.*)$/);
    if (!match?.[1]) {
      continue;
    }
    const title = extractItemTitle(match[1]);
    if (title) {
      titles.push(title);
    }
  }
  return titles;
}

type CatalogBook = {
  apiId: string;
  title: string;
  /** Prefer detail hits over search hits when the same title appears twice. */
  fromDetails: boolean;
};

function pushCatalogBook(
  books: CatalogBook[],
  seen: Map<string, number>,
  book: CatalogBook,
) {
  const existingIndex = seen.get(book.apiId);
  if (existingIndex === undefined) {
    seen.set(book.apiId, books.length);
    books.push(book);
    return;
  }
  if (book.fromDetails && !books[existingIndex]?.fromDetails) {
    books[existingIndex] = book;
  }
}

function catalogFromMessage(message: UIMessage): CatalogBook[] {
  const books: CatalogBook[] = [];
  const seen = new Map<string, number>();

  for (const part of message.parts) {
    if (!isToolUIPart(part) || part.state !== "output-available") {
      continue;
    }
    const toolName = getToolName(part);
    if (toolName !== "get_book_details" && toolName !== "search_books") {
      continue;
    }

    const output = part.output;
    if (!output || typeof output !== "object") {
      continue;
    }
    const record = output as Record<string, unknown>;
    const fromDetails = toolName === "get_book_details";

    if (typeof record.apiId === "string" && typeof record.title === "string") {
      pushCatalogBook(books, seen, {
        apiId: record.apiId,
        title: record.title,
        fromDetails,
      });
      continue;
    }

    if (Array.isArray(record.results)) {
      for (const item of record.results) {
        if (!item || typeof item !== "object") {
          continue;
        }
        const row = item as Record<string, unknown>;
        if (
          typeof row.apiId === "string" &&
          typeof row.title === "string"
        ) {
          pushCatalogBook(books, seen, {
            apiId: row.apiId,
            title: row.title,
            fromDetails: false,
          });
        }
      }
    }
  }

  return books;
}

function matchTitleToApiId(
  title: string,
  catalog: CatalogBook[],
  used: Set<string>,
): string | null {
  const needle = normalizeBookTitle(title);
  if (!needle) {
    return null;
  }

  const candidates = catalog.filter((book) => !used.has(book.apiId));

  // Prefer get_book_details matches — those are the ones the model chose to show.
  const detailsFirst = [
    ...candidates.filter((book) => book.fromDetails),
    ...candidates.filter((book) => !book.fromDetails),
  ];

  const exact = detailsFirst.find(
    (book) => normalizeBookTitle(book.title) === needle,
  );
  if (exact) {
    return exact.apiId;
  }

  const fuzzy = detailsFirst.find((book) => {
    const normalized = normalizeBookTitle(book.title);
    return normalized.includes(needle) || needle.includes(normalized);
  });
  return fuzzy?.apiId ?? null;
}

/**
 * apiIds for the numbered picks in recommendation text, matched against a
 * catalog of search/detail tool outputs (may span multiple assistant messages).
 */
export function matchRecommendationTitlesToApiIds(
  titles: string[],
  catalog: CatalogBook[],
): string[] {
  if (titles.length === 0 || catalog.length === 0) {
    return [];
  }

  const used = new Set<string>();
  const apiIds: string[] = [];

  for (const title of titles) {
    const apiId = matchTitleToApiId(title, catalog, used);
    if (apiId) {
      used.add(apiId);
      apiIds.push(apiId);
    }
  }

  return apiIds;
}

export function extractRecommendationApiIds(message: UIMessage): string[] {
  return matchRecommendationTitlesToApiIds(
    extractRecommendationTitles(messageText(message)),
    catalogFromMessage(message),
  );
}

/** User is referring to the prior recommendation set, not naming new titles. */
export function isReferentialShelfAdd(text: string): boolean {
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  if (!normalized) {
    return false;
  }

  return (
    /\b(all\s+(of\s+)?(those|these|them)|those\s+books|these\s+books|the(se|ose)?\s+recommendations)\b/.test(
      normalized,
    ) ||
    /\b(add|save|put)\s+(all\s+)?(of\s+)?(them|those|these)\b/.test(
      normalized,
    ) ||
    /\bi\s+want\s+to\s+read\s+(all\s+)?(of\s+)?(them|those|these)\b/.test(
      normalized,
    ) ||
    /\bwant\s+to\s+read\s+(all\s+)?(of\s+)?(them|those|these)\b/.test(
      normalized,
    )
  );
}

/**
 * When the latest user message is “add those”, return the apiIds for the
 * numbered titles in the preceding recommendation — never every search hit
 * from that turn (author searches often return extras like other books by
 * the same author).
 */
export function resolveReferentialAddApiIds(
  messages: UIMessage[],
): string[] {
  if (messages.length < 2) {
    return [];
  }

  let lastUserIndex = -1;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "user") {
      lastUserIndex = i;
      break;
    }
  }

  if (lastUserIndex < 0) {
    return [];
  }

  const userMessage = messages[lastUserIndex]!;
  if (!isReferentialShelfAdd(messageText(userMessage))) {
    return [];
  }

  // Recommendation text and tool parts can land in different assistant
  // messages across multi-step turns — match titles against the full catalog
  // from every assistant message before this user request.
  const catalog: CatalogBook[] = [];
  const seen = new Map<string, number>();
  for (let i = 0; i < lastUserIndex; i += 1) {
    const message = messages[i]!;
    if (message.role !== "assistant") {
      continue;
    }
    for (const book of catalogFromMessage(message)) {
      pushCatalogBook(catalog, seen, book);
    }
  }

  for (let i = lastUserIndex - 1; i >= 0; i -= 1) {
    const message = messages[i]!;
    if (message.role !== "assistant") {
      continue;
    }
    const titles = extractRecommendationTitles(messageText(message));
    if (titles.length === 0) {
      continue;
    }
    const apiIds = matchRecommendationTitlesToApiIds(titles, catalog);
    if (apiIds.length > 0) {
      return apiIds;
    }
  }

  return [];
}

export function filterToAllowedApiIds(
  apiIds: string[],
  allowed: string[],
): string[] {
  if (allowed.length === 0) {
    return apiIds;
  }
  const allow = new Set(allowed);
  return apiIds.filter((apiId) => allow.has(apiId));
}
