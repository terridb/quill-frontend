import { z } from "zod";

export const bookSearchQuerySchema = z.object({
  q: z.string().trim().min(2).max(200),
});
