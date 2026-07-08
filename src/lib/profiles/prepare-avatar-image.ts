import { MAX_AVATAR_BYTES, PrepareAvatarError } from "@/src/lib/profiles/errors";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const OUTPUT_DIMENSIONS = [512, 384, 256] as const;
const QUALITY_STEPS = [0.92, 0.85, 0.75, 0.65, 0.55, 0.45] as const;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new PrepareAvatarError("Could not read this image. Try another file."));
    };

    image.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new PrepareAvatarError("Could not process this image."));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

function getOutputMimeType(): { mime: string; extension: string } {
  const canvas = document.createElement("canvas");
  const supportsWebp =
    canvas.toDataURL("image/webp").startsWith("data:image/webp");

  if (supportsWebp) {
    return { mime: "image/webp", extension: "webp" };
  }

  return { mime: "image/jpeg", extension: "jpg" };
}

async function encodeSquareAvatar(
  image: HTMLImageElement,
  dimension: number,
  mime: string,
): Promise<Blob> {
  const side = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = (image.naturalWidth - side) / 2;
  const sourceY = (image.naturalHeight - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = dimension;
  canvas.height = dimension;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new PrepareAvatarError("Could not process this image.");
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    side,
    side,
    0,
    0,
    dimension,
    dimension,
  );

  for (const quality of QUALITY_STEPS) {
    const blob = await canvasToBlob(canvas, mime, quality);
    if (blob.size <= MAX_AVATAR_BYTES) {
      return blob;
    }
  }

  throw new PrepareAvatarError("Image is too large. Choose a smaller photo.");
}

export async function prepareAvatarImage(file: File): Promise<File> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new PrepareAvatarError("Use a JPEG, PNG, or WebP image.");
  }

  const image = await loadImageFromFile(file);
  const { mime, extension } = getOutputMimeType();

  for (const dimension of OUTPUT_DIMENSIONS) {
    try {
      const blob = await encodeSquareAvatar(image, dimension, mime);
      return new File([blob], `avatar.${extension}`, { type: mime });
    } catch (error) {
      if (
        error instanceof PrepareAvatarError &&
        error.message === "Image is too large. Choose a smaller photo." &&
        dimension !== OUTPUT_DIMENSIONS[OUTPUT_DIMENSIONS.length - 1]
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new PrepareAvatarError("Image is too large. Choose a smaller photo.");
}
