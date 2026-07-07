# Avatars storage (Supabase prerequisite)

The create-profile flow uploads processed avatars to Supabase Storage.

## Bucket

- Name: `avatars`
- Public read (required for `next/image` via `*.supabase.co` in `next.config.ts`)

## Object path

`{user_id}/avatar.{ext}` — e.g. `a1b2c3d4-.../avatar.webp`

Use `upsert: true` so re-uploads replace the existing file.

## RLS policies

Authenticated users may only access objects under their own `{user_id}/` prefix:

- **INSERT** — upload to own folder
- **SELECT** — read own objects (required for upsert)
- **UPDATE** — replace own objects (required for upsert)

Grant all three on the `avatars` bucket for the `authenticated` role scoped to `(storage.foldername(name))[1] = auth.uid()::text`.
