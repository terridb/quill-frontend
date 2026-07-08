import type { SupabaseClient } from "@supabase/supabase-js";

export interface UploadedProfileAvatar {
  path: string;
  publicUrl: string;
}

const AVATAR_PUBLIC_PATH_SEGMENT = "/storage/v1/object/public/avatars/";

function getAvatarExtension(file: File): string {
  const rawExtension = file.name.split(".").pop()?.toLowerCase() ?? "webp";
  return rawExtension.replace(/[^a-z0-9]/g, "") || "webp";
}

export function getAvatarStoragePathFromUrl(avatarUrl: string): string | null {
  if (!avatarUrl) {
    return null;
  }

  try {
    const { pathname } = new URL(avatarUrl);
    const pathIndex = pathname.indexOf(AVATAR_PUBLIC_PATH_SEGMENT);

    if (pathIndex === -1) {
      return null;
    }

    return decodeURIComponent(
      pathname.slice(pathIndex + AVATAR_PUBLIC_PATH_SEGMENT.length),
    );
  } catch {
    return null;
  }
}

/**
 * Uploads a processed avatar to the `avatars` bucket.
 * See avatars-storage.md for bucket and RLS prerequisites.
 */
export async function uploadProfileAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File,
): Promise<UploadedProfileAvatar> {
  const extension = getAvatarExtension(file);
  const path = `${userId}/avatar-${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("avatars").upload(path, file, {
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

  return {
    path,
    publicUrl: data.publicUrl,
  };
}

export async function deleteProfileAvatar(
  supabase: SupabaseClient,
  path: string,
): Promise<void> {
  const { error } = await supabase.storage.from("avatars").remove([path]);

  if (error) {
    throw error;
  }
}
