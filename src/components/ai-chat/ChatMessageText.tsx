import type { ReactNode } from "react";

/**
 * Sanitize model text for display: strip images/URLs that blow out mobile layout,
 * unwrap markdown links to labels, and keep simple emphasis.
 */
export function sanitizeChatText(raw: string): string {
  return raw
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\(https?:\/\/[^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
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

export function ChatMessageText({ text }: { text: string }) {
  const cleaned = sanitizeChatText(text);
  if (!cleaned) {
    return null;
  }

  const paragraphs = cleaned.split(/\n{2,}/);

  return (
    <div className="min-w-0 max-w-full space-y-3 overflow-x-hidden break-words [overflow-wrap:anywhere] text-[15px] leading-relaxed text-[var(--color-ink)]">
      {paragraphs.map((paragraph, pIndex) => {
        const lines = paragraph.split("\n");
        return (
          <p key={`p-${pIndex}`} className="min-w-0 max-w-full">
            {lines.map((line, lineIndex) => (
              <span key={`l-${pIndex}-${lineIndex}`}>
                {lineIndex > 0 ? <br /> : null}
                {renderInline(line, `${pIndex}-${lineIndex}`)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
