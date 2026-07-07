import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/src/components/layout/AppShell";
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

  return <AppShell>{children}</AppShell>;
}
