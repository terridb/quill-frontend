"use client";

import { useEffect, useId, useRef, useState } from "react";
import { mapProfileError } from "@/src/lib/profiles/errors";
import { prepareAvatarImage } from "@/src/lib/profiles/prepare-avatar-image";

export interface AvatarPickerProps {
  value: File | null;
  onChange: (file: File | null) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

export function AvatarPicker({
  value,
  onChange,
  onError,
  disabled = false,
}: AvatarPickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const setPreviewFromFile = (file: File | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreviewUrl(url);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsProcessing(true);
    onError("");

    try {
      const processed = await prepareAvatarImage(file);
      setPreviewFromFile(processed);
      onChange(processed);
    } catch (error) {
      setPreviewFromFile(null);
      onChange(null);
      onError(mapProfileError(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    setPreviewFromFile(null);
    onChange(null);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt=""
            className="h-24 w-24 rounded-full object-cover ring-2 ring-[var(--color-border)]"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-sm font-medium text-[var(--color-accent)] ring-2 ring-[var(--color-border)]"
          >
            Photo
          </div>
        )}
        {isProcessing ? (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-[var(--color-ink)]/40 text-xs font-medium text-[var(--color-surface)]">
            Processing…
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled={disabled || isProcessing}
          onClick={() => inputRef.current?.click()}
          className="focus-ring rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-sm font-medium text-[var(--color-ink)] disabled:opacity-60"
          aria-label="Choose profile photo"
        >
          {value ? "Change photo" : "Add photo"}
        </button>
        {value ? (
          <button
            type="button"
            disabled={disabled || isProcessing}
            onClick={handleRemove}
            className="focus-ring text-sm font-medium text-[var(--color-muted)] underline-offset-2 hover:underline disabled:opacity-60"
          >
            Remove photo
          </button>
        ) : null}
      </div>

      <p className="text-center text-xs text-[var(--color-muted)]">
        Square photo, JPEG/PNG/WebP. We&apos;ll resize it for you.
      </p>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => void handleFileChange(event)}
        disabled={disabled || isProcessing}
      />
    </div>
  );
}
