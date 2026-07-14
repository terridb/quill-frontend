export function computeProgressPercent(
  currentPage: number | null,
  pageCount: number | null,
): number | null {
  if (pageCount === null || pageCount <= 0) {
    return null;
  }

  const page = currentPage ?? 0;
  return Math.min(100, Math.round((page / pageCount) * 100));
}
