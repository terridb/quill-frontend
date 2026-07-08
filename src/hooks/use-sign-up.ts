"use client";

import { useMutation } from "@tanstack/react-query";
import { mapAuthError } from "@/src/lib/auth/errors";
import type { RegisterInput } from "@/src/lib/auth/schemas";
import { createClient } from "@/src/lib/supabase/client";

export function useSignUp() {
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      window.location.assign("/create-profile");
    },
  });
}

export function getSignUpErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return mapAuthError(error);
  }
  return mapAuthError(null);
}
