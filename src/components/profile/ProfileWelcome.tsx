"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export interface ProfileWelcomeProps {
  username: string;
}

const REDIRECT_DELAY_MS = 3000;
const EXIT_ANIMATION_MS = 450;

function getMemberNumber(username: string): string {
  let hash = 0;
  for (let index = 0; index < username.length; index += 1) {
    hash = (hash * 31 + username.charCodeAt(index)) >>> 0;
  }

  return `Q-${(hash % 10000).toString().padStart(4, "0")}`;
}

export function ProfileWelcome({ username }: ProfileWelcomeProps) {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const memberNumber = useMemo(() => getMemberNumber(username), [username]);
  const issuedDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date()),
    [],
  );

  useEffect(() => {
    const exitTimeout = window.setTimeout(() => {
      setIsExiting(true);
    }, REDIRECT_DELAY_MS - EXIT_ANIMATION_MS);

    const redirectTimeout = window.setTimeout(() => {
      router.push("/");
    }, REDIRECT_DELAY_MS);

    return () => {
      window.clearTimeout(exitTimeout);
      window.clearTimeout(redirectTimeout);
    };
  }, [router]);

  return (
    <div
      className={`library-card${isExiting ? " library-card--exiting" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="library-card__header">
        <div className="min-w-0">
          <p className="text-[0.625rem] font-medium tracking-[0.22em] text-[var(--color-muted)] uppercase">
            Quill Public Library
          </p>
          <p className="text-display mt-1 text-[1.35rem] leading-none tracking-tight text-[var(--color-ink)]">
            Library card
          </p>
        </div>
        <p className="shrink-0 pt-1 text-[0.625rem] font-medium tracking-[0.18em] text-[var(--color-muted)] uppercase">
          Welcome
        </p>
      </div>

      <div className="library-card__rule" aria-hidden="true" />

      <div className="library-card__body">
        <p className="text-[0.625rem] font-medium tracking-[0.16em] text-[var(--color-muted)] uppercase">
          Cardholder
        </p>
        <h1 className="text-display mt-1.5 text-balance break-words text-[1.85rem] leading-tight tracking-tight text-[var(--color-ink)]">
          {username}
        </h1>

        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 text-left">
          <div>
            <dt className="text-[0.625rem] font-medium tracking-[0.14em] text-[var(--color-muted)] uppercase">
              Member no.
            </dt>
            <dd className="mt-1 font-mono text-sm font-medium tracking-wide text-[var(--color-ink)] tabular-nums">
              {memberNumber}
            </dd>
          </div>
          <div>
            <dt className="text-[0.625rem] font-medium tracking-[0.14em] text-[var(--color-muted)] uppercase">
              Date issued
            </dt>
            <dd className="mt-1 text-sm font-medium text-[var(--color-ink)] tabular-nums">
              {issuedDate}
            </dd>
          </div>
        </dl>

        <div className="relative mt-8 flex justify-center">
          <div className="library-card__stamp" aria-hidden="true">
            Admitted
          </div>
        </div>
      </div>

      <div className="library-card__footer">
        <p className="text-sm text-[var(--color-muted)]">
          Your shelf is ready. Opening it now…
        </p>
        <div className="library-card__progress" aria-hidden="true" />
      </div>
    </div>
  );
}
