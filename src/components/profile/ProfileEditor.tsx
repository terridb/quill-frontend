"use client";

import { useState } from "react";
import { AvatarPicker } from "@/src/components/profile/AvatarPicker";
import {
  getUpdateProfileErrorMessage,
  useUpdateProfile,
} from "@/src/hooks/use-update-profile";

export interface ProfileEditorProps {
  initialAvatarUrl: string;
  onCancel: () => void;
  onSaved: () => void;
}

export function ProfileEditor({
  initialAvatarUrl,
  onCancel,
  onSaved,
}: ProfileEditorProps) {
  const updateProfile = useUpdateProfile();
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSave = async () => {
    setFormError(null);

    if (!avatar) {
      onCancel();
      return;
    }

    try {
      await updateProfile.mutateAsync({ avatar });
      onSaved();
    } catch (error) {
      setFormError(getUpdateProfileErrorMessage(error));
    }
  };

  return (
    <div className="rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-6 shadow-[var(--shadow-sm)] md:px-6 md:py-8">
      <AvatarPicker
        value={avatar}
        onChange={setAvatar}
        onError={setAvatarError}
        disabled={updateProfile.isPending}
        initialAvatarUrl={initialAvatarUrl}
        size="lg"
        showFrame={false}
      />
      {avatarError ? (
        <p role="alert" className="mt-3 text-center text-sm text-[#8b3a3a]">
          {avatarError}
        </p>
      ) : null}
      {formError ? (
        <p role="alert" className="mt-3 text-center text-sm text-[#8b3a3a]">
          {formError}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={updateProfile.isPending}
          className="focus-ring rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[var(--color-surface)] disabled:opacity-60"
        >
          {updateProfile.isPending ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={updateProfile.isPending}
          className="focus-ring rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
