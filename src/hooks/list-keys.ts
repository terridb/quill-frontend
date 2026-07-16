export const listKeys = {
  all: ["lists"] as const,
  currentlyReading: () => [...listKeys.all, "currently-reading"] as const,
  overview: () => [...listKeys.all, "overview"] as const,
  detail: (id: string) => [...listKeys.all, "detail", id] as const,
};
