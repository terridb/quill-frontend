export const readingKeys = {
  all: ["reading"] as const,
  tracker: (weekStart: string, today: string) =>
    [...readingKeys.all, "tracker", weekStart, today] as const,
};
