import { z } from "zod";

export const createProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be 30 characters or fewer.")
    .regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers, and underscores only.")
    .refine((value) => !/^user_[0-9a-f]+$/i.test(value), {
      message: "Choose a username that isn't the default placeholder.",
    }),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
