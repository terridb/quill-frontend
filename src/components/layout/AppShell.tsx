import { PrimaryNav } from "@/src/components/layout/PrimaryNav";

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh min-w-0 flex-col bg-[var(--color-bg)]">
      <PrimaryNav />
      <main className="mx-auto w-full min-w-0 max-w-2xl flex-1 px-5 py-7 md:max-w-3xl md:px-8 md:py-10 lg:max-w-4xl">
        {children}
      </main>
    </div>
  );
}
