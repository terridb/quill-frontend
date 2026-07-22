import { tool } from "ai";
import { z } from "zod";
import type { AiToolContext } from "@/src/lib/ai/tool-context";
import {
  FINISHED_DATE_REGEX,
  isValidFinishedDate,
  missingFinishedDateError,
  setReadingStatus,
} from "@/src/lib/books/set-reading-status";

export function createSetReadingStatusTool(ctx: AiToolContext) {
  return tool({
    description:
      "Move one book to Currently Reading or Finished. For Finished, finishedAt (YYYY-MM-DD) is required — if the user has not said which date they finished the book, do not call this tool; ask them first. Never invent or assume a date. Never use for Did Not Finish. Requires user confirmation before running.",
    inputSchema: z.object({
      apiId: z
        .string()
        .trim()
        .min(1)
        .describe("Google Books volume id of the book to move"),
      readingStatus: z
        .enum(["currently_reading", "finished"])
        .describe("Target built-in shelf"),
      finishedAt: z
        .string()
        .regex(FINISHED_DATE_REGEX, "Use YYYY-MM-DD")
        .refine(isValidFinishedDate, "finishedAt must be a real calendar date")
        .optional()
        .describe(
          "Required when readingStatus is finished. The date the user finished the book (YYYY-MM-DD). Never invent this date.",
        ),
    }),
    needsApproval: true,
    execute: async ({ apiId, readingStatus, finishedAt }) => {
      if (readingStatus === "finished" && !finishedAt) {
        return { error: missingFinishedDateError() };
      }

      if (finishedAt && !isValidFinishedDate(finishedAt)) {
        return {
          error:
            "finishedAt must be a real calendar date in YYYY-MM-DD format.",
        };
      }

      try {
        return await setReadingStatus(ctx.supabase, ctx.userId, apiId, {
          readingStatus,
          finishedAt,
        });
      } catch (error) {
        if (error instanceof Error && error.message) {
          return { error: error.message };
        }
        return { error: "Unable to update reading status." };
      }
    },
  });
}
