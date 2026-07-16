import { tool } from "ai";
import { z } from "zod";
import { fetchGoogleVolume } from "@/src/lib/books/google-books/fetch-google-volume";
import { normalizeCategories } from "@/src/lib/books/google-books/normalize-categories";
import { normalizeDescription } from "@/src/lib/books/google-books/normalize-description";
import { getVolumeLanguage } from "@/src/lib/books/google-books/is-recommendable-volume";
import { pickCoverUrl } from "@/src/lib/books/google-books/pick-cover-url";
import { truncateText } from "@/src/lib/ai/truncate";

export function createGetBookDetailsTool() {
  return tool({
    description:
      "Fetch catalog details for a single book by Google Books volume id (apiId). Use after search or when the user names a specific title.",
    inputSchema: z.object({
      apiId: z.string().trim().min(1).describe("Google Books volume id"),
    }),
    execute: async ({ apiId }) => {
      try {
        const volume = await fetchGoogleVolume(apiId);
        const { volumeInfo } = volume;
        const { genreLabels, subjectTags } = normalizeCategories(
          volumeInfo.categories,
          volumeInfo.mainCategory,
        );
        const pageCount = volumeInfo.pageCount;

        return {
          apiId: volume.id,
          title: volumeInfo.title ?? "Untitled",
          authors: volumeInfo.authors?.length
            ? volumeInfo.authors.join(", ")
            : "Unknown author",
          description: truncateText(normalizeDescription(volumeInfo.description)),
          genreLabels,
          subjectTags,
          coverUrl: pickCoverUrl(volumeInfo.imageLinks),
          pageCount:
            typeof pageCount === "number" && pageCount > 0 ? pageCount : null,
          language: getVolumeLanguage(volume),
          publishedDate: volumeInfo.publishedDate ?? null,
        };
      } catch {
        return { error: "Book not found or unavailable." };
      }
    },
  });
}
