"use client";

import { useQuery } from "@tanstack/react-query";
import { authKeys } from "@/src/hooks/auth-keys";
import type { Profile } from "@/src/types/profile";
import { createClient } from "@/src/lib/supabase/client";

async function fetchCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, username, avatar_url, setup_complete")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    user_id: data.user_id,
    username: data.username ?? "",
    avatar_url: data.avatar_url ?? "",
    setup_complete: data.setup_complete ?? false,
  };
}

export function useProfile() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: fetchCurrentProfile,
    staleTime: 60_000,
  });
}
