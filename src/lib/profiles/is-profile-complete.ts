import type { Profile } from "@/src/types/profile";

export function isProfileComplete(profile: Profile | null): boolean {
  return profile?.setup_complete === true;
}
