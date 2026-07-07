"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/src/hooks/auth-keys";
import { mapProfileError } from "@/src/lib/profiles/errors";
import type { CreateProfileInput } from "@/src/lib/profiles/schemas";
import { updateCurrentProfile } from "@/src/lib/profiles/update-current-profile";
import { uploadProfileAvatar } from "@/src/lib/profiles/upload-avatar";
import { createClient } from "@/src/lib/supabase/client";

export interface UpdateProfileInput extends CreateProfileInput {
  avatar?: File;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to update your profile.");
      }

      let avatarUrl: string | undefined;

      if (input.avatar) {
        avatarUrl = await uploadProfileAvatar(supabase, user.id, input.avatar);
      }

      await updateCurrentProfile(supabase, {
        username: input.username,
        avatarUrl,
      });

      return input.username;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
}

export function getUpdateProfileErrorMessage(error: unknown): string {
  return mapProfileError(error);
}
