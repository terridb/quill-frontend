import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
