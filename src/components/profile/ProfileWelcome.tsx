"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/src/components/auth/AuthCard";

export interface ProfileWelcomeProps {
  username: string;
}

const REDIRECT_DELAY_MS = 3000;

export function ProfileWelcome({ username }: ProfileWelcomeProps) {
  const router = useRouter();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.push("/");
    }, REDIRECT_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <AuthCard eyebrow="New member" title={`Welcome, ${username}`}>
      <div className="space-y-6 text-center">
        <div className="relative mx-auto w-fit">
          <div
            className="rounded-full border-2 border-dashed border-[var(--color-accent)] px-5 py-2 text-[0.6875rem] font-medium tracking-[0.18em] text-[var(--color-accent)] uppercase motion-safe:animate-pulse"
            aria-hidden="true"
          >
            Admitted
          </div>
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          Your shelf is ready. Taking you there now…
        </p>
      </div>
    </AuthCard>
  );
}
