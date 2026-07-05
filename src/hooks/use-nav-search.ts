"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useSearch } from "@/src/providers/search-provider";

export function useNavSearch() {
  const inputId = useId();
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { query, setQuery } = useSearch();
  const pathname = usePathname();

  useEffect(() => {
    setIsPanelOpen(false);
  }, [pathname]);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const openPanelIfEligible = useCallback(() => {
    setIsPanelOpen(query.length >= 2);
  }, [query.length]);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      setIsPanelOpen(value.length >= 2);
    },
    [setQuery],
  );

  return {
    query,
    isPanelOpen,
    containerRef,
    handleChange,
    closePanel,
    openPanelIfEligible,
    inputId,
    panelId,
  };
}
