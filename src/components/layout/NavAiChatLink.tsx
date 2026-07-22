"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatMessageIcon } from "@/src/components/ui/icons";

export function NavAiChatLink() {
  const pathname = usePathname();
  const isActive = pathname === "/ai-chat" || pathname.startsWith("/ai-chat/");

  return (
    <Link
      href="/ai-chat"
      aria-label="Ask Quill"
      aria-current={isActive ? "page" : undefined}
      className={`focus-ring hidden size-9 items-center justify-center rounded-full transition-colors md:inline-flex ${
        isActive
          ? "text-[var(--color-accent)]"
          : "text-[var(--color-ink-secondary)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
      }`}
    >
      <ChatMessageIcon className="size-5" filled={isActive} />
    </Link>
  );
}
