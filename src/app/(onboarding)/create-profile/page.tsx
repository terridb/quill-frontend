import { redirect } from "next/navigation";
import { CreateProfileForm } from "@/src/components/profile/CreateProfileForm";
import { getCurrentProfile } from "@/src/lib/profiles/get-current-profile";
import { isProfileComplete } from "@/src/lib/profiles/is-profile-complete";
import { createClient } from "@/src/lib/supabase/server";

export default async function CreateProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/create-profile");
  }

  const profile = await getCurrentProfile(user.id);

  if (isProfileComplete(profile)) {
    redirect("/");
  }

  return <CreateProfileForm />;
}
