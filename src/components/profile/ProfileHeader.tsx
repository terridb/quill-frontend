"use client";

import { NavAvatar } from "@/src/components/layout/NavAvatar";
import { ProfileEditor } from "@/src/components/profile/ProfileEditor";

export interface ProfileHeaderProps {
  username: string;
  avatarUrl: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaved: () => void;
}

export function ProfileHeader({
  username,
  avatarUrl,
  isEditing,
  onEdit,
  onCancelEdit,
  onSaved,
}: ProfileHeaderProps) {
  if (isEditing) {
    return (
      <ProfileEditor
        initialAvatarUrl={avatarUrl}
        onCancel={onCancelEdit}
        onSaved={onSaved}
      />
    );
  }

  return (
    <header className="flex flex-col items-center rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-8 text-center shadow-[var(--shadow-sm)] md:px-7 md:py-9">
      <NavAvatar avatarUrl={avatarUrl} label={username} size="lg" />
      <p className="mt-5 text-[0.68rem] font-medium tracking-[0.18em] text-[var(--color-muted)] uppercase">
        Reader profile
      </p>
      <h1 className="text-display mt-3 max-w-full truncate text-[2rem] leading-tight tracking-tight text-[var(--color-ink)] md:text-[2.35rem]">
        {username}
      </h1>
      <div className="mt-8 w-full border-t border-[var(--color-border)] pt-6">
        <button
          type="button"
          onClick={onEdit}
          className="focus-ring rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-accent-soft)]"
        >
          Edit
        </button>
      </div>
    </header>
  );
}
