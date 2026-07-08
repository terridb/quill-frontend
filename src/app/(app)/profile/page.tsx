import { ProfilePage } from "@/src/components/profile/ProfilePage";
import { getCurrentlyReading } from "@/src/lib/lists/get-currently-reading";
import { getCurrentProfile } from "@/src/lib/profiles/get-current-profile";
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfileRoutePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  const [profile, currentlyReading] = await Promise.all([
    getCurrentProfile(user.id),
    getCurrentlyReading(user.id),
  ]);

  if (!profile) {
    redirect("/create-profile");
  }

  return (
    <ProfilePage
      initialProfile={profile}
      initialCurrentlyReading={currentlyReading}
    />
  );
}
