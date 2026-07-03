"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookSearchMobilePage } from "@/src/components/search/BookSearchMobilePage";
import { useMediaQuery } from "@/src/hooks/use-media-query";

export function SearchPageClient() {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (isDesktop) {
      router.replace("/");
    }
  }, [isDesktop, router]);

  if (isDesktop) {
    return null;
  }

  return <BookSearchMobilePage />;
}
