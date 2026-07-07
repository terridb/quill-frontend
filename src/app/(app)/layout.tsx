import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/src/components/layout/AppShell";
import { getCurrentProfile } from "@/src/lib/profiles/get-current-profile";
import { isProfileComplete } from "@/src/lib/profiles/is-profile-complete";
import { createClient } from "@/src/lib/supabase/server";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") ?? "/";
    const search = headersList.get("x-search") ?? "";
    const next = `${pathname}${search}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const profile = await getCurrentProfile(user.id);

  if (!isProfileComplete(profile)) {
    redirect("/create-profile");
  }

  return <AppShell>{children}</AppShell>;
}
