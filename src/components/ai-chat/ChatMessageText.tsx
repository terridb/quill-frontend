import type { ReactNode } from "react";
import { BookMentionCard } from "@/src/components/ai-chat/BookMentionCard";
import { normalizeBookTitle } from "@/src/lib/ai/book-identity";

export type ChatBookMention = {
  apiId: string;
  title: string;
  authors: string;
  coverUrl: string | null;
  description?: string | null;
};

/**
 * Sanitize model text for display: strip images/URLs that blow out mobile layout,
 * unwrap markdown links to labels, and normalize whitespace.
 */
export function sanitizeChatText(raw: string): string {
  return raw
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\(https?:\/\/[^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\*\*([^*]+)\*\*|(?<!\*)\*([^*]+)\*(?!\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const bold = match[1];
    const italic = match[2];
    if (bold) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold">
          {bold}
        </strong>,
      );
    } else if (italic) {
      nodes.push(
        <em key={`${keyPrefix}-i-${i}`} className="italic">
          {italic}
        </em>,
      );
    }
    lastIndex = match.index + match[0].length;
    i += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

const ORDERED_ITEM = /^\d+\.\s+(.*)$/;
const UNORDERED_ITEM = /^[-*]\s+(.*)$/;

function isOrderedItem(line: string): boolean {
  return ORDERED_ITEM.test(line);
}

function isUnorderedItem(line: string): boolean {
  return UNORDERED_ITEM.test(line);
}

function isListItem(line: string): boolean {
  return isOrderedItem(line) || isUnorderedItem(line);
}

function listItemText(line: string): string {
  const ordered = line.match(ORDERED_ITEM);
  if (ordered) {
    return ordered[1] ?? line;
  }
  const unordered = line.match(UNORDERED_ITEM);
  return unordered?.[1] ?? line;
}

function extractItemTitle(itemText: string): string {
  const bold = itemText.match(/\*\*([^*]+)\*\*/);
  if (bold?.[1]) {
    return bold[1].trim();
  }
  const bySplit = itemText.split(/\s+by\s+/i)[0];
  return (bySplit ?? itemText).replace(/^[*_]+|[*_]+$/g, "").trim();
}

function matchBook(
  itemText: string,
  books: ChatBookMention[],
  usedApiIds: Set<string>,
): ChatBookMention | null {
  const needle = normalizeBookTitle(extractItemTitle(itemText));
  if (!needle) {
    return null;
  }

  const candidates = books.filter((book) => !usedApiIds.has(book.apiId));
  const exact = candidates.find(
    (book) => normalizeBookTitle(book.title) === needle,
  );
  if (exact) {
    return exact;
  }

  return (
    candidates.find((book) => {
      const title = normalizeBookTitle(book.title);
      return title.includes(needle) || needle.includes(title);
    }) ?? null
  );
}

type ParsedBlock =
  | { type: "paragraph"; lines: string[] }
  | { type: "list"; ordered: boolean; items: string[] };

/** Allow blank lines between list items so 1/2/3 stay one list (not three lists of "1."). */
export function parseChatBlocks(cleaned: string): ParsedBlock[] {
  const lines = cleaned.split("\n");
  const blocks: ParsedBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (isListItem(line)) {
      const ordered = isOrderedItem(line);
      const items: string[] = [];

      while (i < lines.length) {
        const current = lines[i] ?? "";
        if (!current.trim()) {
          // Peek ahead: blank line inside a list is fine if another item follows.
          let look = i + 1;
          while (look < lines.length && !(lines[look] ?? "").trim()) {
            look += 1;
          }
          const next = lines[look] ?? "";
          if (
            next &&
            isListItem(next) &&
            isOrderedItem(next) === ordered
          ) {
            i = look;
            continue;
          }
          break;
        }
        if (!isListItem(current) || isOrderedItem(current) !== ordered) {
          break;
        }
        items.push(listItemText(current));
        i += 1;
      }

      blocks.push({ type: "list", ordered, items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const current = lines[i] ?? "";
      if (!current.trim()) {
        break;
      }
      if (isListItem(current)) {
        break;
      }
      paragraphLines.push(current);
      i += 1;
    }

    blocks.push({ type: "paragraph", lines: paragraphLines });
  }

  return blocks;
}

export function ChatMessageText({
  text,
  books = [],
}: {
  text: string;
  books?: ChatBookMention[];
}) {
  const cleaned = sanitizeChatText(text);
  if (!cleaned) {
    return null;
  }

  const blocks = parseChatBlocks(cleaned);
  const usedApiIds = new Set<string>();
  const rendered: ReactNode[] = [];

  blocks.forEach((block, blockKey) => {
    if (block.type === "paragraph") {
      rendered.push(
        <p key={`p-${blockKey}`} className="min-w-0 max-w-full">
          {block.lines.map((paragraphLine, lineIndex) => (
            <span key={`l-${blockKey}-${lineIndex}`}>
              {lineIndex > 0 ? <br /> : null}
              {renderInline(paragraphLine, `${blockKey}-${lineIndex}`)}
            </span>
          ))}
        </p>,
      );
      return;
    }

    if (block.ordered && books.length > 0) {
      rendered.push(
        <div key={`recs-${blockKey}`} className="min-w-0 max-w-full space-y-4">
          {block.items.map((item, itemIndex) => {
            const book = matchBook(item, books, usedApiIds);
            if (book) {
              usedApiIds.add(book.apiId);
            }

            return (
              <div
                key={`rec-${blockKey}-${itemIndex}`}
                className="min-w-0 max-w-full space-y-2"
              >
                {book ? (
                  <BookMentionCard
                    apiId={book.apiId}
                    title={book.title}
                    authors={book.authors}
                    coverUrl={book.coverUrl}
                  />
                ) : null}
                <p className="min-w-0 max-w-full text-[15px] leading-relaxed text-[var(--color-ink)]">
                  <span className="font-medium text-[var(--color-ink-secondary)]">
                    {itemIndex + 1}.{" "}
                  </span>
                  {renderInline(item, `rec-${blockKey}-${itemIndex}`)}
                </p>
              </div>
            );
          })}
        </div>,
      );
      return;
    }

    const ListTag = block.ordered ? "ol" : "ul";
    rendered.push(
      <ListTag
        key={`list-${blockKey}`}
        className={
          block.ordered
            ? "min-w-0 max-w-full list-decimal space-y-2 pl-5"
            : "min-w-0 max-w-full list-disc space-y-2 pl-5"
        }
        start={1}
      >
        {block.items.map((item, itemIndex) => (
          <li
            key={`li-${blockKey}-${itemIndex}`}
            className="min-w-0 pl-1"
            value={itemIndex + 1}
          >
            {renderInline(item, `${blockKey}-${itemIndex}`)}
          </li>
        ))}
      </ListTag>,
    );
  });

  return (
    <div className="min-w-0 max-w-full space-y-3 overflow-x-hidden break-words [overflow-wrap:anywhere] text-[15px] leading-relaxed text-[var(--color-ink)]">
      {rendered}
    </div>
  );
}
