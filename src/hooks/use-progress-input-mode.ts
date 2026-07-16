"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "pagefolk:progress-input-mode:v1";

export type ProgressInputMode = "pages" | "percent";

export function useProgressInputMode() {
  const [mode, setMode] = useState<ProgressInputMode>("pages");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "pages" || stored === "percent") {
        setMode(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const updateMode = (next: ProgressInputMode) => {
    setMode(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  return [mode, updateMode] as const;
}
