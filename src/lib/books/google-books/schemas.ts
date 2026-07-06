import { z } from "zod";

const googleBooksImageLinksSchema = z.object({
  smallThumbnail: z.string().optional(),
  thumbnail: z.string().optional(),
  small: z.string().optional(),
  medium: z.string().optional(),
  large: z.string().optional(),
  extraLarge: z.string().optional(),
});

const googleBooksIndustryIdentifierSchema = z.object({
  type: z.string(),
  identifier: z.string(),
});

export const googleBooksVolumeInfoSchema = z.object({
  title: z.string().optional(),
  authors: z.array(z.string()).optional(),
  description: z.string().optional(),
  categories: z.array(z.string()).optional(),
  pageCount: z.number().optional(),
  imageLinks: googleBooksImageLinksSchema.optional(),
  industryIdentifiers: z
    .array(googleBooksIndustryIdentifierSchema)
    .optional(),
});

export const googleBooksVolumeSchema = z.object({
  id: z.string(),
  volumeInfo: googleBooksVolumeInfoSchema,
});

export const googleBooksSearchResponseSchema = z.object({
  totalItems: z.number().optional(),
  items: z.array(googleBooksVolumeSchema).optional(),
});

export type GoogleBooksVolume = z.infer<typeof googleBooksVolumeSchema>;
export type GoogleBooksVolumeInfo = z.infer<typeof googleBooksVolumeInfoSchema>;
