-- Speed up related-book overlap lookups on genres/tags arrays.
-- Applied via Supabase MCP migration: add_books_genres_tags_gin_indexes

CREATE INDEX IF NOT EXISTS books_genres_gin_idx ON public.books USING gin (genres);
CREATE INDEX IF NOT EXISTS books_tags_gin_idx ON public.books USING gin (tags);
