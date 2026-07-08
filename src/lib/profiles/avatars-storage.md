# Avatars storage (Supabase prerequisite)

The create-profile flow uploads processed avatars to Supabase Storage.

## Bucket

- Name: `avatars`
- Public read (required for `next/image` via `*.supabase.co` in `next.config.ts`)

## Object path

`{user_id}/avatar-{timestamp}-{uuid}.{ext}` — e.g. `a1b2c3d4-.../avatar-1720470185123-550e8400-e29b-41d4-a716-446655440000.webp`

Each upload should use a fresh object path. Do not use `upsert`.

When replacing an avatar:

1. Upload the new object first.
2. Update `profiles.avatar_url` to the new public URL.
3. Best-effort delete the previous object path after the profile row update succeeds.

## RLS policies

Authenticated users may only access objects under their own `{user_id}/` prefix:

- **INSERT** — upload to own folder
- **SELECT** — read avatar objects when needed
- **UPDATE** — optional if you ever reintroduce overwrites
- **DELETE** — remove old avatar objects after a successful swap

Grant these policies on the `avatars` bucket for the `authenticated` role scoped to `(storage.foldername(name))[1] = auth.uid()::text`.
