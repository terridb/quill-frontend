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
  collectConversationBooks,
  collectConversationListNames,
  extractBookMentions,
  getForbiddenApprovalReason,
  getToolApprovalCopy,
  getVisibleToolActivity,
  groupPendingApprovals,
  mergeBookMentions,
  resolveBooksForApiIds,
} from "@/src/components/ai-chat/tool-ui-helpers";
import {
  QuillMascot,
  type QuillMascotMood,
} from "@/src/components/ui/QuillMascot";
import {
  filterToAllowedApiIds,
  resolveReferentialAddApiIds,
} from "@/src/lib/ai/recommendation-scope";
import { listKeys } from "@/src/hooks/list-keys";
import { bookKeys } from "@/src/hooks/book-keys";
import { readingKeys } from "@/src/hooks/reading-keys";
import { formatLocalDate } from "@/src/lib/reading/format-local-date";

const WRITE_TOOLS = new Set([
  "create_custom_list",
  "add_books_to_list",
  "remove_books_from_list",
  "set_reading_status",
]);

/** Detail results preferred for covers; search fills gaps when matching recommendations. */
const BOOK_CARD_TOOLS = new Set(["search_books", "get_book_details"]);

const STARTER_PROMPTS = [
  "Something like my finished books",
  "A short book I can finish this week",
  "Add Project Hail Mary to Want To Read",
] as const;

function extractMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

/** Quill is waiting on the reader (clarifying question in the last reply). */
function messageEndsWithQuestion(message: UIMessage): boolean {
  const text = extractMessageText(message);
  if (!text) {
    return false;
  }
  // Trailing ? optionally followed by closing quotes / brackets
  return /\?[’”"'\)\]]*\s*$/.test(text);
}

/** Last reply looks like Quill came up empty on finds / recommendations. */
function messageLooksLikeEmptyFind(message: UIMessage): boolean {
  const text = extractMessageText(message);
  if (!text) {
    return false;
  }

  // Numbered recommendation list present — not empty-handed.
  if (/(?:^|\n)\s*1\.\s/.test(text)) {
    return false;
  }

  const lower = text.toLowerCase();
  return (
    /could(?:['’]t| not) find/.test(lower) ||
    /did(?:['’]t| not) find/.test(lower) ||
    /came up empty/.test(lower) ||
    /empty[- ]handed/.test(lower) ||
    /nothing (?:fitting|matching|new|that|useful)/.test(lower) ||
    /no (?:good )?matches/.test(lower) ||
    /no titles?(?:\s+\w+){0,4}\s+(?:that|to|for)/.test(lower) ||
    /struck out/.test(lower)
  );
}

/** Every search_books call in this message returned zero hits (and no numbered picks). */
function messageHadOnlyEmptySearches(message: UIMessage): boolean {
  const text = extractMessageText(message);
  if (!text || /(?:^|\n)\s*1\.\s/.test(text)) {
    return false;
  }

  let sawSearch = false;

  for (const part of message.parts) {
    if (!isToolUIPart(part) || part.state !== "output-available") {
      continue;
    }
    if (getToolName(part) !== "search_books") {
      continue;
    }
    sawSearch = true;
    const output = part.output;
    if (
      output &&
      typeof output === "object" &&
      Array.isArray((output as { results?: unknown }).results) &&
      (output as { results: unknown[] }).results.length > 0
    ) {
      return false;
    }
  }

  return sawSearch;
}

function collectMessageBooks(message: UIMessage): ChatBookMention[] {
  const collected: ChatBookMention[] = [];

  for (const part of message.parts) {
    if (!isToolUIPart(part) || part.state !== "output-available") {
      continue;
    }
    if (!BOOK_CARD_TOOLS.has(getToolName(part))) {
      continue;
    }
    collected.push(...extractBookMentions(part.output));
  }

  return mergeBookMentions(collected);
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
  messages,
  addToolApprovalResponse,
}: {
  message: UIMessage;
  messages: UIMessage[];
  addToolApprovalResponse: (response: {
    id: string;
    approved: boolean;
  }) => void;
}) {
  const books = collectMessageBooks(message);
  const catalog = collectConversationBooks(messages);
  const listNames = collectConversationListNames(messages);
  const referentialApiIds = resolveReferentialAddApiIds(messages);
  const approvalGroups = groupPendingApprovals(message)
    .map((group) => {
      if (
        group.toolName !== "add_books_to_list" ||
        referentialApiIds.length === 0
      ) {
        return group;
      }
      return {
        ...group,
        apiIds: filterToAllowedApiIds(group.apiIds, referentialApiIds),
      };
    })
    .filter((group) => {
      if (
        group.toolName === "add_books_to_list" &&
        referentialApiIds.length > 0
      ) {
        return group.apiIds.length > 0;
      }
      return true;
    });
  let renderedApprovals = false;
  let renderedDenied = false;
  const toolActivity = getVisibleToolActivity(message);

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

        if (part.state === "approval-requested" && part.approval) {
          if (renderedApprovals) {
            return null;
          }
          renderedApprovals = true;

          return (
            <div key={`${message.id}-approvals`} className="space-y-3">
              {approvalGroups.map((group) => {
                const forbiddenReason = getForbiddenApprovalReason(
                  group.toolName,
                  group.input,
                );

                if (forbiddenReason) {
                  return group.approvalIds.map((approvalId) => (
                    <ForbiddenApprovalNotice
                      key={approvalId}
                      approvalId={approvalId}
                      reason={forbiddenReason}
                      addToolApprovalResponse={addToolApprovalResponse}
                    />
                  ));
                }

                const groupBooks = resolveBooksForApiIds(
                  group.apiIds,
                  catalog,
                );
                const listName = group.listId
                  ? (listNames.get(group.listId) ?? null)
                  : null;
                const copy = getToolApprovalCopy(group.toolName, group.input, {
                  books: groupBooks,
                  listName,
                  bookCount: group.apiIds.length || groupBooks.length,
                });

                return (
                  <ToolApprovalCard
                    key={group.approvalIds.join("-")}
                    title={copy.title}
                    description={copy.description}
                    books={groupBooks}
                    onConfirm={() => {
                      for (const approvalId of group.approvalIds) {
                        addToolApprovalResponse({
                          id: approvalId,
                          approved: true,
                        });
                      }
                    }}
                    onCancel={() => {
                      for (const approvalId of group.approvalIds) {
                        addToolApprovalResponse({
                          id: approvalId,
                          approved: false,
                        });
                      }
                    }}
                  />
                );
              })}
            </div>
          );
        }

        if (part.state === "output-denied") {
          if (renderedDenied) {
            return null;
          }
          renderedDenied = true;
          return (
            <p key={`${message.id}-denied`} className="text-sm text-[var(--color-muted)]">
              Change canceled.
            </p>
          );
        }

        // Tool activity is a single shelf-whisper below — never a stack of steps.
        return null;
      })}

      {toolActivity ? (
        <p
          key={`${message.id}-activity-${toolActivity.label}`}
          className="quill-tool-activity"
          data-active={toolActivity.active ? "true" : "false"}
          aria-live="polite"
        >
          <span className="quill-tool-activity__whiskers" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="quill-tool-activity__text">{toolActivity.label}</span>
        </p>
      ) : null}
    </div>
  );
}

export function AiChatPage() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, addToolApprovalResponse } =
    useChat({
      transport: new DefaultChatTransport({
        api: "/api/ai-chat",
        body: () => ({ clientToday: formatLocalDate(new Date()) }),
      }),
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

  const lastAssistant = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");
  const lastMessage = messages[messages.length - 1];
  const awaitingApproval =
    lastAssistant != null &&
    lastAssistant.parts.some(
      (part) =>
        isToolUIPart(part) &&
        part.state === "approval-requested" &&
        part.approval,
    );
  const awaitingUserReply =
    !isBusy &&
    lastMessage?.role === "assistant" &&
    lastAssistant != null &&
    messageEndsWithQuestion(lastAssistant);
  const emptyFind =
    !isBusy &&
    lastMessage?.role === "assistant" &&
    lastAssistant != null &&
    (messageLooksLikeEmptyFind(lastAssistant) ||
      messageHadOnlyEmptySearches(lastAssistant));

  let mascotMood: QuillMascotMood = "happy";
  if (error || emptyFind) {
    mascotMood = "oops";
  } else if (isBusy || awaitingApproval || awaitingUserReply) {
    mascotMood = "question";
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isBusy) {
      return;
    }
    setInput("");
    void sendMessage({ text });
  };

  const askQuill = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy) {
      return;
    }
    setInput("");
    void sendMessage({ text: trimmed });
  };

  const handleInputFocus = () => {
    // Prevent mobile browsers from scrolling the locked page when focusing the composer.
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  return (
    <div className="ai-chat-page flex min-h-0 w-full min-w-0 max-w-2xl flex-1 flex-col overflow-x-hidden overflow-y-hidden">
      <header className="ai-chat-header shrink-0 border-b border-[var(--color-border)]/80 pt-4 pb-4 md:pt-6 md:pb-5">
        <div className="flex items-end gap-3 sm:gap-4">
          <QuillMascot
            mood={mascotMood}
            size="lg"
            className="-mb-1 -ml-2 sm:-ml-1"
          />
          <div className="min-w-0 flex-1 pb-2">
            <p className="text-label tracking-[0.08em] uppercase">
              Reads like a friend
            </p>
            <h1 className="text-display mt-1 text-[1.85rem] leading-none tracking-tight text-[var(--color-ink)] md:text-[2.15rem]">
              Ask Quill!
            </h1>
            <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-[var(--color-ink-secondary)]">
              Stuck on what to read? Quill digs your shelves, sniffs out new
              finds, and keeps the spoilers to himself.
            </p>
          </div>
        </div>
      </header>

      <div
        ref={messagesRef}
        className={`min-h-0 min-w-0 flex-1 space-y-5 overscroll-y-contain pt-5 pb-4 [-webkit-overflow-scrolling:touch] ${
          messages.length > 0
            ? "overflow-x-hidden overflow-y-auto"
            : "overflow-hidden"
        }`}
      >
        {messages.length === 0 ? (
          <div className="ai-chat-empty flex flex-col justify-center gap-6 px-1 py-6">
            <div>
              <p className="text-display text-[1.35rem] leading-snug text-[var(--color-ink)] md:text-2xl">
                What should we pull off the shelf?
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--color-ink-secondary)]">
                Quill is ready when you are. Pick a starter, or type your own.
              </p>
            </div>
            <ul className="flex flex-col gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <li key={prompt}>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => askQuill(prompt)}
                    className="focus-ring ai-chat-starter w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/80 px-4 py-3 text-left text-[15px] leading-snug text-[var(--color-ink)] transition-[border-color,background-color] disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {messages.map((message) => (
          <article
            key={message.id}
            className={
              message.role === "user"
                ? "ml-6 min-w-0 max-w-full overflow-x-hidden rounded-2xl rounded-br-md bg-[var(--color-accent-soft)] px-4 py-3 sm:ml-12"
                : "mr-2 min-w-0 max-w-full overflow-x-hidden sm:mr-4"
            }
          >
            <p className="text-label mb-1.5">
              {message.role === "user" ? "You" : "Quill"}
            </p>
            <MessageParts
              message={message}
              messages={messages}
              addToolApprovalResponse={addToolApprovalResponse}
            />
          </article>
        ))}

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200/80 bg-red-50/90 px-3.5 py-2.5 text-sm text-red-900"
          >
            {error.message || "Quill couldn’t finish that. Try again."}
          </p>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit}
        className="ai-chat-composer shrink-0 border-t border-[var(--color-border)]/80 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <label htmlFor="ai-chat-input" className="sr-only">
          Message Quill
        </label>
        <div className="input-surface flex items-end gap-2 rounded-2xl p-2">
          <textarea
            id="ai-chat-input"
            rows={2}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onFocus={handleInputFocus}
            placeholder="Tell Quill what you’re in the mood for…"
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
            className="focus-ring shrink-0 rounded-xl bg-[var(--color-accent)] px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Ask
          </button>
        </div>
      </form>
    </div>
  );
}
