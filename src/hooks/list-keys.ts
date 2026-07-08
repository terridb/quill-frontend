export const listKeys = {
  all: ["lists"] as const,
  currentlyReading: () => [...listKeys.all, "currently-reading"] as const,
};
