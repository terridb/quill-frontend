"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard } from "@/src/components/auth/AuthCard";
import { AuthField } from "@/src/components/auth/AuthField";
import { QuillSpinner } from "@/src/components/ui/QuillSpinner";
import {
  getSignInErrorMessage,
  useSignIn,
} from "@/src/hooks/use-sign-in";
import { loginSchema } from "@/src/lib/auth/schemas";

export function LoginForm() {
  const signIn = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ email, password });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    try {
      await signIn.mutateAsync(parsed.data);
    } catch (error) {
      setFormError(getSignInErrorMessage(error));
    }
  };

  return (
    <AuthCard eyebrow="Library card" title="Sign in">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AuthField
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          error={fieldErrors.email}
          autoComplete="email"
        />
        <AuthField
          id="login-password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          autoComplete="current-password"
        />
        {formError ? (
          <p role="alert" className="text-sm text-[#8b3a3a]">
            {formError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={signIn.isPending}
          className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-medium text-[var(--color-surface)] disabled:opacity-60"
        >
          {signIn.isPending ? (
            <>
              <QuillSpinner size="sm" decorative />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
        <p className="text-center text-sm text-[var(--color-muted)]">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="focus-ring font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
