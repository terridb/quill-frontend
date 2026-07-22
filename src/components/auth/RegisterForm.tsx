"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard } from "@/src/components/auth/AuthCard";
import { AuthField } from "@/src/components/auth/AuthField";
import { QuillSpinner } from "@/src/components/ui/QuillSpinner";
import {
  getSignUpErrorMessage,
  useSignUp,
} from "@/src/hooks/use-sign-up";
import { registerSchema } from "@/src/lib/auth/schemas";

export function RegisterForm() {
  const signUp = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = registerSchema.safeParse({
      email,
      password,
      confirmPassword,
    });

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
      await signUp.mutateAsync(parsed.data);
    } catch (error) {
      setFormError(getSignUpErrorMessage(error));
    }
  };

  return (
    <AuthCard eyebrow="Library card" title="Create account">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AuthField
          id="register-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          error={fieldErrors.email}
          autoComplete="email"
        />
        <AuthField
          id="register-password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          autoComplete="new-password"
        />
        <AuthField
          id="register-confirm-password"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
        />
        {formError ? (
          <p role="alert" className="text-sm text-[#8b3a3a]">
            {formError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={signUp.isPending}
          className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-medium text-[var(--color-surface)] disabled:opacity-60"
        >
          {signUp.isPending ? (
            <>
              <QuillSpinner size="sm" decorative />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>
        <p className="text-center text-sm text-[var(--color-muted)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="focus-ring font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
