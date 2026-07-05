import Link from "next/link";
import { MobileNav } from "@/src/components/layout/MobileNav";
import { NavSearch } from "@/src/components/layout/NavSearch";

export function PrimaryNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-lg">
      <div className="md:hidden">
        <MobileNav />
      </div>
      <div className="mx-auto hidden max-w-5xl items-center gap-8 px-6 py-3.5 md:flex">
        <Link
          href="/"
          className="focus-ring text-display shrink-0 text-[1.65rem] leading-none tracking-tight text-[var(--color-ink)]"
        >
          Quill
        </Link>
        <div className="flex-1">
          <NavSearch />
        </div>
      </div>
    </header>
  );
}
