"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookmarkIcon } from "@/src/components/ui/icons";

export function NavListsLink() {
  const pathname = usePathname();
  const isActive = pathname === "/lists" || pathname.startsWith("/lists/");

  return (
    <Link
      href="/lists"
      aria-label="Your lists"
      aria-current={isActive ? "page" : undefined}
      className={`focus-ring hidden size-9 items-center justify-center rounded-full transition-colors md:inline-flex ${
        isActive
          ? "text-[var(--color-accent)]"
          : "text-[var(--color-ink-secondary)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
      }`}
    >
      <BookmarkIcon className="size-5" filled={isActive} />
    </Link>
  );
}
