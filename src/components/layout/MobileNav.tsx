"use client";

import { usePathname } from "next/navigation";
import { NavBrandLink } from "@/src/components/layout/NavBrandLink";
import { MobileNavAccount } from "@/src/components/layout/MobileNavAccount";
import { useEffect, useRef, useState } from "react";
import { BookSearchPanel } from "@/src/components/layout/BookSearchPanel";
import { SearchIcon } from "@/src/components/ui/icons";
import { SearchInput } from "@/src/components/ui/SearchInput";
import { useNavSearch } from "@/src/hooks/use-nav-search";

export function MobileNav() {
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const {
    query,
    isPanelOpen,
    containerRef,
    handleChange,
    closePanel,
    openPanelIfEligible,
    inputId,
    panelId,
  } = useNavSearch();

  useEffect(() => {
    setIsSearchExpanded(false);
  }, [pathname]);

  const collapseSearch = () => {
    setIsSearchExpanded(false);
    closePanel();
  };

  const handleSearchToggle = () => {
    if (isSearchExpanded) {
      collapseSearch();
      return;
    }

    setIsSearchExpanded(true);
    openPanelIfEligible();
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative px-5 pt-[calc(0.875rem+env(safe-area-inset-top,0px))] pb-3"
    >
      <div className="grid grid-cols-3 items-center">
        <div className="flex justify-start">
          <button
            type="button"
            onClick={handleSearchToggle}
            aria-label="Search"
            aria-expanded={isSearchExpanded}
            aria-controls={isSearchExpanded ? inputId : undefined}
            className={`focus-ring flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              isSearchExpanded
                ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            <SearchIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex justify-center">
          <NavBrandLink
            className="focus-ring text-display text-[1.65rem] leading-none tracking-tight text-[var(--color-ink)]"
            onNavigate={collapseSearch}
          />
        </div>

        <div className="flex justify-end">
          <MobileNavAccount />
        </div>
      </div>

      {isSearchExpanded ? (
        <div className="absolute inset-x-0 top-full z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 px-5 pt-2 pb-3 shadow-[var(--shadow-md)] backdrop-blur-lg">
          <div className="relative" role="search">
            <SearchInput
              id={inputId}
              value={query}
              onChange={handleChange}
              className="w-full"
              combobox
              inputRef={inputRef}
              aria-controls={isPanelOpen ? panelId : undefined}
              aria-expanded={isPanelOpen}
            />
            <BookSearchPanel
              panelId={panelId}
              isOpen={isPanelOpen}
              onClose={closePanel}
              containerRef={containerRef}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
