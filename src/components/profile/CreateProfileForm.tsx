"use client";

import { useState } from "react";
import { AuthCard } from "@/src/components/auth/AuthCard";
import { AuthField } from "@/src/components/auth/AuthField";
import { AvatarPicker } from "@/src/components/profile/AvatarPicker";
import { ProfileWelcome } from "@/src/components/profile/ProfileWelcome";
import {
  getUpdateProfileErrorMessage,
  useUpdateProfile,
} from "@/src/hooks/use-update-profile";
import { createProfileSchema } from "@/src/lib/profiles/schemas";

type FormPhase = "form" | "welcome";

export function CreateProfileForm() {
  const updateProfile = useUpdateProfile();
  const [phase, setPhase] = useState<FormPhase>("form");
  const [username, setUsername] = useState("");
  const [savedUsername, setSavedUsername] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = createProfileSchema.safeParse({ username });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    try {
      await updateProfile.mutateAsync({
        username: parsed.data.username,
        avatar: avatar ?? undefined,
      });
      setSavedUsername(parsed.data.username);
      setPhase("welcome");
    } catch (error) {
      setFormError(getUpdateProfileErrorMessage(error));
    }
  };

  if (phase === "welcome") {
    return <ProfileWelcome username={savedUsername} />;
  }

  return (
    <AuthCard eyebrow="New member" title="Finish your profile">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AvatarPicker
          value={avatar}
          onChange={setAvatar}
          onError={setAvatarError}
          disabled={updateProfile.isPending}
          placeholderLabel={username}
        />
        {avatarError ? (
          <p role="alert" className="text-center text-sm text-[#8b3a3a]">
            {avatarError}
          </p>
        ) : null}
        <AuthField
          id="create-profile-username"
          label="Username"
          type="text"
          value={username}
          onChange={setUsername}
          error={fieldErrors.username}
          autoComplete="username"
        />
        {formError ? (
          <p role="alert" className="text-sm text-[#8b3a3a]">
            {formError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="focus-ring w-full rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-medium text-[var(--color-surface)] disabled:opacity-60"
        >
          {updateProfile.isPending ? "Saving profile…" : "Save profile"}
        </button>
      </form>
    </AuthCard>
  );
}
