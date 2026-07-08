const MAX_AVATAR_BYTES = 500 * 1024;

export class PrepareAvatarError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PrepareAvatarError";
  }
}

export function mapProfileError(error: unknown): string {
  if (error instanceof PrepareAvatarError) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const record = error as { code?: string; message?: string };

    if (record.code === "23505") {
      return "That username is already taken.";
    }

    if (record.message) {
      const message = record.message.toLowerCase();

      if (message.includes("duplicate") || message.includes("unique")) {
        return "That username is already taken.";
      }

      if (message.includes("storage") || message.includes("upload")) {
        return "Could not upload your photo. Try again.";
      }
    }
  }

  if (error instanceof Error) {
    if (error.message.includes("too large")) {
      return "Image is too large. Choose a smaller photo.";
    }

    if (error.message.includes("JPEG") || error.message.includes("PNG")) {
      return error.message;
    }
  }

  return "Something went wrong. Try again.";
}

export { MAX_AVATAR_BYTES };
