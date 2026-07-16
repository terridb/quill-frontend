import { MobileNav } from "@/src/components/layout/MobileNav";
import { NavAccount } from "@/src/components/layout/NavAccount";
import { NavAiChatLink } from "@/src/components/layout/NavAiChatLink";
import { NavBrandLink } from "@/src/components/layout/NavBrandLink";
import { NavListsLink } from "@/src/components/layout/NavListsLink";
import { NavSearch } from "@/src/components/layout/NavSearch";

export function PrimaryNav() {
  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-lg">
      <div className="md:hidden">
        <MobileNav />
      </div>
      <div className="mx-auto hidden h-[var(--header-height)] max-w-5xl items-center gap-8 px-6 md:flex">
        <NavBrandLink className="focus-ring shrink-0" />
        <div className="flex-1">
          <NavSearch />
        </div>
        <div className="flex items-center gap-3">
          <NavAiChatLink />
          <NavListsLink />
          <NavAccount />
        </div>
      </div>
    </header>
  );
}
