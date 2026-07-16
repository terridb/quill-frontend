"use client";

import Link from "next/link";
import { ListBookshelfSection } from "@/src/components/lists/ListBookshelfSection";
import { useCurrentlyReading } from "@/src/hooks/use-currently-reading";
import { useProfile } from "@/src/hooks/use-profile";
import type { CurrentlyReadingResult } from "@/src/lib/lists/get-currently-reading";
import type { Profile } from "@/src/types/profile";
import { ProfileHeader } from "@/src/components/profile/ProfileHeader";
import { useState } from "react";

export interface ProfilePageProps {
  initialProfile: Profile;
  initialCurrentlyReading: CurrentlyReadingResult;
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
  const reading = currentlyReading ?? initialCurrentlyReading;
  const seeAllHref = reading.listId ? `/lists/${reading.listId}` : "/lists";

  return (
    <div className="profile-page md:grid md:grid-cols-[18rem_minmax(0,1fr)] md:gap-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-12">
      <aside className="md:sticky md:top-[calc(var(--header-offset)+1rem)] md:self-start">
        <ProfileHeader
          username={activeProfile.username}
          avatarUrl={activeProfile.avatar_url ?? ""}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onCancelEdit={() => setIsEditing(false)}
          onSaved={() => setIsEditing(false)}
        />
      </aside>
      <div className="mt-8 border-t border-[var(--color-border)] pt-8 md:mt-0 md:min-w-0 md:border-t-0 md:border-l md:pt-0 md:pl-10 lg:pl-12">
        <ListBookshelfSection
          headingId="currently-reading-heading"
          title="Currently Reading"
          isPrivate={reading.isPrivate}
          books={reading.books}
          seeAllHref={seeAllHref}
          isLoading={isLoading && reading.books.length === 0}
          isError={isError}
          onRetry={() => void refetch()}
        />
        <div className="mt-10 border-t border-[var(--color-border)] pt-8 md:mt-12">
          <Link
            href="/lists"
            className="focus-ring flex w-full items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-accent-soft)] md:max-w-[15rem]"
          >
            View all lists
          </Link>
        </div>
      </div>
    </div>
  );
}
