export function getCoverUrl(coverId: number | undefined): string | null {
  if (coverId === undefined) {
    return null;
  }

  return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}
