import { MobileNav } from "@/src/components/layout/MobileNav";
import { NavBrandLink } from "@/src/components/layout/NavBrandLink";
import { NavSearch } from "@/src/components/layout/NavSearch";

export function PrimaryNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-lg">
      <div className="md:hidden">
        <MobileNav />
      </div>
      <div className="mx-auto hidden h-[var(--header-height)] max-w-5xl items-center gap-8 px-6 md:flex">
        <NavBrandLink className="focus-ring text-display shrink-0 text-[1.65rem] leading-none tracking-tight text-[var(--color-ink)]" />
        <div className="flex-1">
          <NavSearch />
        </div>
      </div>
    </header>
  );
}
