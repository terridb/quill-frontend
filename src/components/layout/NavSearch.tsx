"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { BookSearchPanel } from "@/src/components/layout/BookSearchPanel";
import { SearchInput } from "@/src/components/ui/SearchInput";
import { useSearch } from "@/src/providers/search-provider";

export function NavSearch() {
  const inputId = useId();
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { query, setQuery } = useSearch();
  const pathname = usePathname();

  useEffect(() => {
    setIsPanelOpen(false);
  }, [pathname]);

  const handleChange = (value: string) => {
    setQuery(value);
    setIsPanelOpen(value.length >= 2);
  };

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
        onClose={() => setIsPanelOpen(false)}
        containerRef={containerRef}
      />
    </div>
  );
}
