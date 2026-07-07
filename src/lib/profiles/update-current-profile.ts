import type { SupabaseClient } from "@supabase/supabase-js";

export interface UpdateCurrentProfileInput {
  username: string;
  avatarUrl?: string;
}

export async function updateCurrentProfile(
  supabase: SupabaseClient,
  input: UpdateCurrentProfileInput,
): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be signed in to update your profile.");
  }

  const updates: {
    username: string;
    setup_complete: boolean;
    avatar_url?: string;
  } = {
    username: input.username,
    setup_complete: true,
  };

  if (input.avatarUrl) {
    updates.avatar_url = input.avatarUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }
}
