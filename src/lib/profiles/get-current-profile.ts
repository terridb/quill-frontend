import { cache } from "react";
import { createClient } from "@/src/lib/supabase/server";
import type { Profile } from "@/src/types/profile";

function mapProfileRow(data: {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  setup_complete: boolean | null;
}): Profile {
  return {
    user_id: data.user_id,
    username: data.username ?? "",
    avatar_url: data.avatar_url ?? "",
    setup_complete: data.setup_complete ?? false,
  };
}

export const getCurrentProfile = cache(
  async (userId: string): Promise<Profile | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, username, avatar_url, setup_complete")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapProfileRow(data);
  },
);
