import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Uploads a processed avatar to the `avatars` bucket.
 * See avatars-storage.md for bucket and RLS prerequisites.
 */
export async function uploadProfileAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File,
): Promise<string> {
  const extension = file.name.split(".").pop() ?? "webp";
  const path = `${userId}/avatar.${extension}`;

  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type,
    cacheControl: "3600",
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);

  if (!data.publicUrl) {
    throw new Error("Could not get avatar URL after upload.");
  }

  return data.publicUrl;
}
