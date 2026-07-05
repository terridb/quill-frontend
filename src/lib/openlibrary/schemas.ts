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

const openLibraryDescriptionSchema = z.union([
  z.string(),
  z.object({ value: z.string() }),
]);

export const openLibraryWorkSchema = z.object({
  key: z.string(),
  title: z.string().optional(),
  description: openLibraryDescriptionSchema.optional(),
  subjects: z.array(z.string()).optional(),
  covers: z.array(z.number()).optional(),
  authors: z
    .array(
      z.object({
        author: z.object({ key: z.string() }),
      }),
    )
    .optional(),
});

export const openLibraryEditionEntrySchema = z.object({
  key: z.string().optional(),
  number_of_pages: z.number().optional(),
  languages: z.array(z.object({ key: z.string() })).optional(),
  physical_format: z.string().optional(),
});

export const openLibraryEditionsResponseSchema = z.object({
  entries: z.array(openLibraryEditionEntrySchema).optional(),
});

export const openLibraryAuthorSchema = z.object({
  key: z.string(),
  name: z.string().optional(),
});

export const openLibrarySubjectWorkSchema = z.object({
  key: z.string(),
  title: z.string().optional(),
  cover_id: z.number().optional(),
  authors: z
    .array(
      z.object({
        name: z.string().optional(),
      }),
    )
    .optional(),
});

export const openLibrarySubjectsResponseSchema = z.object({
  works: z.array(openLibrarySubjectWorkSchema).optional(),
});
