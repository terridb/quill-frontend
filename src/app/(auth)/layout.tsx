import Link from "next/link";
import { QuillLogo } from "@/src/components/ui/QuillLogo";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh min-w-0 flex-col items-center bg-[var(--color-bg)]">
      <header className="w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-lg">
        <div className="mx-auto flex h-[var(--header-height)] max-w-5xl items-center justify-center px-6">
          <Link href="/" className="focus-ring" aria-label="Go to homepage">
            <QuillLogo decorative className="h-10 w-auto text-[var(--color-accent)]" />
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full min-w-0 max-w-md flex-1 flex-col justify-center px-5 py-10 md:px-8">
        {children}
      </main>
    </div>
  );
}
