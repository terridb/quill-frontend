"use client";

import { useEffect, useState, type RefObject } from "react";
import {
  calculateShelfLayout,
  type ShelfLayout,
} from "@/src/lib/lists/shelf-layout";

export function useShelfLayout(
  bookCount: number,
  containerRef: RefObject<HTMLElement | null>,
) {
  const [layout, setLayout] = useState<ShelfLayout>(() =>
    calculateShelfLayout(360, bookCount),
  );

  useEffect(() => {
    const element = containerRef.current;

    if (!element || bookCount === 0) {
      return;
    }

    const update = () => {
      const width = element.clientWidth;
      setLayout(calculateShelfLayout(width, bookCount));
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, [bookCount, containerRef]);

  return layout;
}
