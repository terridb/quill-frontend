"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
  isToolUIPart,
  getToolName,
  type UIMessage,
} from "ai";
import { useQueryClient } from "@tanstack/react-query";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  ChatMessageText,
  type ChatBookMention,
} from "@/src/components/ai-chat/ChatMessageText";
import { ToolApprovalCard } from "@/src/components/ai-chat/ToolApprovalCard";
import {
  extractBookMentions,
  getForbiddenApprovalReason,
  getToolApprovalCopy,
} from "@/src/components/ai-chat/tool-ui-helpers";
import { listKeys } from "@/src/hooks/list-keys";
import { bookKeys } from "@/src/hooks/book-keys";
import { readingKeys } from "@/src/hooks/reading-keys";

const WRITE_TOOLS = new Set([
  "create_custom_list",
  "add_books_to_list",
  "remove_books_from_list",
]);

/** Detail results preferred for covers; search fills gaps when matching recommendations. */
const BOOK_CARD_TOOLS = new Set(["search_books", "get_book_details"]);

function collectMessageBooks(message: UIMessage): ChatBookMention[] {
  const byApiId = new Map<string, ChatBookMention>();

  for (const part of message.parts) {
    if (!isToolUIPart(part) || part.state !== "output-available") {
      continue;
    }
    if (!BOOK_CARD_TOOLS.has(getToolName(part))) {
      continue;
    }

    for (const book of extractBookMentions(part.output)) {
      const existing = byApiId.get(book.apiId);
      // Prefer detail payloads (they include description / better metadata).
      if (!existing || book.description) {
        byApiId.set(book.apiId, book);
      }
    }
  }

  return [...byApiId.values()];
}

function ForbiddenApprovalNotice({
  approvalId,
  reason,
  addToolApprovalResponse,
}: {
  approvalId: string;
  reason: string;
  addToolApprovalResponse: (response: {
    id: string;
    approved: boolean;
  }) => void;
}) {
  const deny = useEffectEvent(() => {
    addToolApprovalResponse({ id: approvalId, approved: false });
  });

  useEffect(() => {
    deny();
  }, [approvalId]);

  return (
    <p className="text-sm text-[var(--color-muted)]">{reason}</p>
  );
}

function MessageParts({
  message,
  addToolApprovalResponse,
}: {
  message: UIMessage;
  addToolApprovalResponse: (response: {
    id: string;
    approved: boolean;
  }) => void;
}) {
  const books = collectMessageBooks(message);

  return (
    <div className="min-w-0 max-w-full space-y-3 overflow-x-hidden">
      {message.parts.map((part, index) => {
        if (part.type === "text" && part.text.trim()) {
          return (
            <ChatMessageText
              key={`${message.id}-text-${index}`}
              text={part.text}
              books={books}
            />
          );
        }

        if (!isToolUIPart(part)) {
          return null;
        }

        const toolName = getToolName(part);
        const key = `${message.id}-${part.toolCallId}`;

        if (part.state === "approval-requested" && part.approval) {
          const input =
            part.input && typeof part.input === "object"
              ? (part.input as Record<string, unknown>)
              : {};
          const forbiddenReason = getForbiddenApprovalReason(toolName, input);

          if (forbiddenReason) {
            return (
              <ForbiddenApprovalNotice
                key={key}
                approvalId={part.approval.id}
                reason={forbiddenReason}
                addToolApprovalResponse={addToolApprovalResponse}
              />
            );
          }

          const copy = getToolApprovalCopy(toolName, input);
          return (
            <ToolApprovalCard
              key={key}
              title={copy.title}
              description={copy.description}
              onConfirm={() =>
                addToolApprovalResponse({
                  id: part.approval.id,
                  approved: true,
                })
              }
              onCancel={() =>
                addToolApprovalResponse({
                  id: part.approval.id,
                  approved: false,
                })
              }
            />
          );
        }

        // Book cards are interleaved with recommendation text — do not dump
        // search grids above the answer (forces scroll-back to see covers).
        if (part.state === "output-available") {
          return null;
        }

        if (part.state === "output-denied") {
          return (
            <p key={key} className="text-sm text-[var(--color-muted)]">
              Change canceled.
            </p>
          );
        }

        if (
          part.state === "input-streaming" ||
          part.state === "input-available" ||
          part.state === "approval-responded"
        ) {
          return (
            <p key={key} className="text-label">
              Looking things up…
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}

export function AiChatPage() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, addToolApprovalResponse } =
    useChat({
      transport: new DefaultChatTransport({ api: "/api/ai-chat" }),
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    });

  const invalidateLibraryCaches = useEffectEvent(() => {
    void queryClient.invalidateQueries({ queryKey: listKeys.all });
    void queryClient.invalidateQueries({ queryKey: bookKeys.all });
    void queryClient.invalidateQueries({ queryKey: readingKeys.all });
  });

  useEffect(() => {
    document.documentElement.dataset.aiChat = "true";
    return () => {
      delete document.documentElement.dataset.aiChat;
    };
  }, []);

  useEffect(() => {
    const lastAssistant = [...messages]
      .reverse()
      .find((message) => message.role === "assistant");

    if (!lastAssistant) {
      return;
    }

    const wrote = lastAssistant.parts.some((part) => {
      if (!isToolUIPart(part) || part.state !== "output-available") {
        return false;
      }
      return WRITE_TOOLS.has(getToolName(part));
    });

    if (wrote) {
      invalidateLibraryCaches();
    }
  }, [messages]);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container || messages.length === 0) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  const isBusy = status === "submitted" || status === "streaming";

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isBusy) {
      return;
    }
    setInput("");
    void sendMessage({ text });
  };

  const handleInputFocus = () => {
    // Prevent mobile browsers from scrolling the locked page when focusing the composer.
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  return (
    <div className="ai-chat-page flex min-h-0 w-full min-w-0 max-w-2xl flex-1 flex-col overflow-x-hidden overflow-y-hidden">
      <header className="ai-chat-header shrink-0 border-b border-[var(--color-border)] pt-5 pb-4 md:pt-8">
        <p className="text-label tracking-[0.08em] uppercase">Shelf note</p>
        <h1 className="text-display mt-2 text-[1.75rem] leading-tight tracking-tight text-[var(--color-ink)] md:text-[2rem]">
          Ask Quill
        </h1>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-[var(--color-ink-secondary)]">
          Get picks from your shelves and new finds — no spoilers, only books
          we can look up.
        </p>
      </header>

      <div
        ref={messagesRef}
        className={`min-h-0 min-w-0 flex-1 space-y-5 overscroll-y-contain py-5 [-webkit-overflow-scrolling:touch] ${
          messages.length > 0
            ? "overflow-x-hidden overflow-y-auto"
            : "overflow-hidden"
        }`}
      >
        {messages.length === 0 ? (
          <div className="ai-chat-empty rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/70 px-5 py-8">
            <p className="text-display text-xl text-[var(--color-ink)]">
              What should you read next?
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-secondary)]">
              Try “something like my finished books” or “add Project Hail Mary
              to Want To Read.”
            </p>
          </div>
        ) : null}

        {messages.map((message) => (
          <article
            key={message.id}
            className={
              message.role === "user"
                ? "ml-4 min-w-0 max-w-full overflow-x-hidden rounded-xl bg-[var(--color-accent-soft)] px-4 py-3 sm:ml-8"
                : "mr-0 min-w-0 max-w-full overflow-x-hidden sm:mr-2"
            }
          >
            <p className="text-label mb-1.5">
              {message.role === "user" ? "You" : "Quill"}
            </p>
            <MessageParts
              message={message}
              addToolApprovalResponse={addToolApprovalResponse}
            />
          </article>
        ))}

        {isBusy ? (
          <p className="text-label animate-pulse">Quill is thinking…</p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            {error.message || "Something went wrong. Try again."}
          </p>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg)] pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <label htmlFor="ai-chat-input" className="sr-only">
          Message Quill
        </label>
        <div className="input-surface flex items-end gap-2 rounded-xl p-2">
          <textarea
            id="ai-chat-input"
            rows={2}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onFocus={handleInputFocus}
            placeholder="Ask for a recommendation…"
            className="max-h-40 min-h-[2.75rem] flex-1 resize-none bg-transparent px-2 py-2 text-[15px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                const text = input.trim();
                if (!text || isBusy) {
                  return;
                }
                setInput("");
                void sendMessage({ text });
              }
            }}
          />
          <button
            type="submit"
            disabled={isBusy || !input.trim()}
            className="focus-ring shrink-0 rounded-lg bg-[var(--color-accent)] px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
