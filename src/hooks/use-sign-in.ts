"use client";

import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { mapAuthError } from "@/src/lib/auth/errors";
import type { LoginInput } from "@/src/lib/auth/schemas";
import { createClient } from "@/src/lib/supabase/client";

function getPostLoginPath(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/";
}

export function useSignIn() {
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        throw error;
      }

      return getPostLoginPath(searchParams.get("next"));
    },
    onSuccess: (destination) => {
      window.location.assign(destination);
    },
  });
}

export function getSignInErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return mapAuthError(error);
  }
  return mapAuthError(null);
}
