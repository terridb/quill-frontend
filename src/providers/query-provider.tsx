"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { installEventTargetGuard } from "@/src/lib/dom/install-event-target-guard";
import { makeQueryClient } from "@/src/lib/query-client";

installEventTargetGuard();

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
