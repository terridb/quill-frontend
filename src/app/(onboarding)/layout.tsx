import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/src/lib/supabase/server";

export default async function OnboardingLayout({
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
    const pathname = headersList.get("x-pathname") ?? "/create-profile";
    const search = headersList.get("x-search") ?? "";
    const next = `${pathname}${search}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return (
    <div className="flex min-h-dvh min-w-0 flex-col bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-lg">
        <div className="mx-auto flex h-[var(--header-height)] max-w-5xl items-center justify-center px-6">
          <Link
            href="/"
            className="focus-ring text-display text-[1.65rem] leading-none tracking-tight text-[var(--color-ink)]"
          >
            Quill
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full min-w-0 max-w-md flex-1 flex-col justify-center px-5 py-10 md:px-8">
        {children}
      </main>
    </div>
  );
}
