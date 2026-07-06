"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSearch } from "@/src/providers/search-provider";

export interface NavBrandLinkProps {
  className?: string;
  onNavigate?: () => void;
}

export function NavBrandLink({ className, onNavigate }: NavBrandLinkProps) {
  const pathname = usePathname();
  const { setQuery } = useSearch();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    setQuery("");
    onNavigate?.();

    if (pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Link
      href="/"
      className={className}
      onClick={handleClick}
      aria-label="Go to homepage"
    >
      Quill
    </Link>
  );
}
