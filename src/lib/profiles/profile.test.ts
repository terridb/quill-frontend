import { describe, expect, it } from "vitest";
import { mapProfileError, PrepareAvatarError } from "@/src/lib/profiles/errors";
import { isProfileComplete } from "@/src/lib/profiles/is-profile-complete";
import type { Profile } from "@/src/types/profile";

describe("isProfileComplete", () => {
  it("returns false for null profile", () => {
    expect(isProfileComplete(null)).toBe(false);
  });

  it("returns false when setup_complete is false", () => {
    const profile: Profile = {
      user_id: "1",
      username: "reader",
      avatar_url: "",
      setup_complete: false,
    };
    expect(isProfileComplete(profile)).toBe(false);
  });

  it("returns true when setup_complete is true", () => {
    const profile: Profile = {
      user_id: "1",
      username: "reader",
      avatar_url: "",
      setup_complete: true,
    };
    expect(isProfileComplete(profile)).toBe(true);
  });
});

describe("mapProfileError", () => {
  it("maps unique violation to username taken", () => {
    expect(mapProfileError({ code: "23505", message: "duplicate" })).toBe(
      "That username is already taken.",
    );
  });

  it("maps prepare avatar errors", () => {
    expect(
      mapProfileError(new PrepareAvatarError("Use a JPEG, PNG, or WebP image.")),
    ).toBe("Use a JPEG, PNG, or WebP image.");
  });

  it("returns generic message for unknown errors", () => {
    expect(mapProfileError(new Error("boom"))).toBe(
      "Something went wrong. Try again.",
    );
  });
});
