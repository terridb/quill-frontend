import { NavUserMenu } from "@/src/components/layout/NavUserMenu";
import { getCurrentProfile } from "@/src/lib/profiles/get-current-profile";
import { createClient } from "@/src/lib/supabase/server";

export async function NavAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await getCurrentProfile(user.id);

  return (
    <NavUserMenu profile={profile} email={user.email ?? ""} />
  );
}
