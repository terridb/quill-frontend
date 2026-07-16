import { tool } from "ai";
import { z } from "zod";
import { createList } from "@/src/lib/lists/create-list";
import type { AiToolContext } from "@/src/lib/ai/tool-context";

export function createCreateCustomListTool(ctx: AiToolContext) {
  return tool({
    description:
      "Create a new custom list for this user. Does not delete lists. Requires user confirmation before running.",
    inputSchema: z.object({
      name: z.string().trim().min(1).max(100),
      isPrivate: z
        .boolean()
        .optional()
        .describe("Whether the list is private. Defaults to false."),
    }),
    needsApproval: true,
    execute: async ({ name, isPrivate = false }) => {
      try {
        const list = await createList(ctx.supabase, ctx.userId, {
          name,
          isPrivate,
        });

        return {
          id: list.id,
          name: list.name,
          isPrivate: list.isPrivate,
        };
      } catch {
        return { error: "Unable to create that list." };
      }
    },
  });
}
