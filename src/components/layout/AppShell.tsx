import { PrimaryNav } from "@/src/components/layout/PrimaryNav";

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell flex h-dvh min-h-0 min-w-0 flex-col overflow-hidden bg-[var(--color-bg)]">
      <PrimaryNav />
      <main className="app-shell-main mx-auto min-h-0 w-full min-w-0 max-w-2xl flex-1 overflow-y-auto px-5 py-7 md:max-w-3xl md:px-8 md:py-10 lg:max-w-4xl">
        {children}
      </main>
    </div>
  );
}
