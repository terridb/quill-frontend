"use client";

import { useState } from "react";
import { CurrentlyReadingSection } from "@/src/components/profile/CurrentlyReadingSection";
import { ListsOverviewButton } from "@/src/components/profile/ListsOverviewButton";
import { ProfileHeader } from "@/src/components/profile/ProfileHeader";
import { useCurrentlyReading } from "@/src/hooks/use-currently-reading";
import { useProfile } from "@/src/hooks/use-profile";
import type { CurrentlyReadingBook } from "@/src/types/list";
import type { Profile } from "@/src/types/profile";

export interface ProfilePageProps {
  initialProfile: Profile;
  initialCurrentlyReading: CurrentlyReadingBook[];
}

export function ProfilePage({
  initialProfile,
  initialCurrentlyReading,
}: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: profile } = useProfile();
  const {
    data: currentlyReading,
    isLoading,
    isError,
    refetch,
  } = useCurrentlyReading(initialCurrentlyReading);

  const activeProfile = profile ?? initialProfile;
  const books = currentlyReading ?? initialCurrentlyReading;

  return (
    <div className="profile-page md:grid md:grid-cols-[18rem_minmax(0,1fr)] md:gap-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-12">
      <aside className="md:sticky md:top-[calc(var(--header-offset)+1rem)] md:self-start">
        <ProfileHeader
          username={activeProfile.username}
          avatarUrl={activeProfile.avatar_url}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onCancelEdit={() => setIsEditing(false)}
          onSaved={() => setIsEditing(false)}
        />
      </aside>
      <div className="mt-8 border-t border-[var(--color-border)] pt-8 md:mt-0 md:min-w-0 md:border-t-0 md:border-l md:pt-0 md:pl-10 lg:pl-12">
        <CurrentlyReadingSection
          books={books}
          isLoading={isLoading && books.length === 0}
          isError={isError}
          onRetry={() => void refetch()}
        />
        <ListsOverviewButton />
      </div>
    </div>
  );
}
