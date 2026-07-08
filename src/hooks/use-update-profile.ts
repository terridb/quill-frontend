"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/src/hooks/auth-keys";
import { mapProfileError } from "@/src/lib/profiles/errors";
import { updateCurrentProfile } from "@/src/lib/profiles/update-current-profile";
import {
  deleteProfileAvatar,
  getAvatarStoragePathFromUrl,
  uploadProfileAvatar,
} from "@/src/lib/profiles/upload-avatar";
import { createClient } from "@/src/lib/supabase/client";

export interface UpdateProfileInput {
  username?: string;
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
      let previousAvatarPath: string | null = null;
      let nextAvatarPath: string | null = null;

      if (input.avatar) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        previousAvatarPath = getAvatarStoragePathFromUrl(profile?.avatar_url ?? "");

        const uploadedAvatar = await uploadProfileAvatar(
          supabase,
          user.id,
          input.avatar,
        );
        avatarUrl = uploadedAvatar.publicUrl;
        nextAvatarPath = uploadedAvatar.path;
      }

      await updateCurrentProfile(supabase, {
        username: input.username,
        avatarUrl,
      });

      if (
        previousAvatarPath &&
        nextAvatarPath &&
        previousAvatarPath !== nextAvatarPath
      ) {
        try {
          await deleteProfileAvatar(supabase, previousAvatarPath);
        } catch {
          // The profile already points at the new avatar, so cleanup can fail silently.
        }
      }

      return input.username ?? user.id;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
}

export function getUpdateProfileErrorMessage(error: unknown): string {
  return mapProfileError(error);
}
