"use client";

import { BookSearchPanel } from "@/src/components/layout/BookSearchPanel";
import { SearchInput } from "@/src/components/ui/SearchInput";
import { useNavSearch } from "@/src/hooks/use-nav-search";

export function NavSearch() {
  const {
    query,
    isPanelOpen,
    containerRef,
    handleChange,
    closePanel,
    inputId,
    panelId,
  } = useNavSearch();

  return (
    <div ref={containerRef} className="relative w-full max-w-md" role="search">
      <SearchInput
        id={inputId}
        value={query}
        onChange={handleChange}
        className="w-full"
        combobox
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
  );
}
