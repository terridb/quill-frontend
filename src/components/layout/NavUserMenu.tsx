"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "@/src/app/auth/actions";
import { NavAvatar } from "@/src/components/layout/NavAvatar";
import { isOutsideElement } from "@/src/lib/dom/safe-event-target";
import type { Profile } from "@/src/types/profile";

export interface NavUserMenuProps {
  profile: Profile | null;
  email: string;
  showListsLink?: boolean;
}

export function NavUserMenu({ profile, email, showListsLink = false }: NavUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const label = profile?.username || email;

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && isOutsideElement(containerRef.current, event)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="focus-ring size-9 shrink-0 overflow-hidden rounded-full p-0"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label="Account menu"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <NavAvatar
          avatarUrl={profile?.avatar_url ?? ""}
          label={label}
          size="sm"
        />
      </button>
      {isOpen ? (
        <ul
          id={menuId}
          role="menu"
          className="absolute top-full right-0 z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-[var(--shadow-md)]"
        >
          {showListsLink ? (
            <>
              <li role="none" className="md:hidden">
                <Link
                  href="/ai-chat"
                  role="menuitem"
                  className="focus-ring block px-4 py-2.5 text-sm text-[var(--color-ink)] transition-colors hover:bg-[var(--color-accent-soft)]"
                  onClick={() => setIsOpen(false)}
                >
                  Ask Quill
                </Link>
              </li>
              <li role="none" className="md:hidden">
                <Link
                  href="/lists"
                  role="menuitem"
                  className="focus-ring block px-4 py-2.5 text-sm text-[var(--color-ink)] transition-colors hover:bg-[var(--color-accent-soft)]"
                  onClick={() => setIsOpen(false)}
                >
                  Lists
                </Link>
              </li>
            </>
          ) : null}
          <li role="none">
            <Link
              href="/profile"
              role="menuitem"
              className="focus-ring block px-4 py-2.5 text-sm text-[var(--color-ink)] transition-colors hover:bg-[var(--color-accent-soft)]"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              disabled={isSigningOut}
              className="focus-ring w-full px-4 py-2.5 text-left text-sm text-[var(--color-ink)] transition-colors hover:bg-[var(--color-accent-soft)] disabled:opacity-60"
              onClick={() => void handleSignOut()}
            >
              {isSigningOut ? "Signing out…" : "Sign out"}
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
