import { z } from "zod";

export const bookSearchQuerySchema = z.object({
  q: z.string().trim().min(2).max(200),
});

export const openLibraryDocSchema = z.object({
  key: z.string(),
  title: z.string().optional(),
  author_name: z.array(z.string()).optional(),
  cover_i: z.number().optional(),
});

export const openLibrarySearchResponseSchema = z.object({
  numFound: z.number(),
  docs: z.array(openLibraryDocSchema),
});
