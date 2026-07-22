-- Restrict authenticated UPDATE on public.books to language backfill only.
-- Applied via Supabase MCP migration: restrict_books_update_to_language_backfill

DROP POLICY IF EXISTS "Authenticated users can update books" ON public.books;

CREATE POLICY "Authenticated users can backfill missing language"
ON public.books
FOR UPDATE
TO authenticated
USING (language IS NULL)
WITH CHECK (language IS NOT NULL);

REVOKE UPDATE ON TABLE public.books FROM authenticated;
GRANT UPDATE (language) ON TABLE public.books TO authenticated;

-- list_entries insert/delete updates books.shelf_count via trigger; that must
-- not run as the caller (who lacks UPDATE on shelf_count).
CREATE OR REPLACE FUNCTION public.update_shelf_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE books SET shelf_count = shelf_count + 1 WHERE id = NEW.book_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE books SET shelf_count = shelf_count - 1 WHERE id = OLD.book_id;
  END IF;
  RETURN NULL;
END;
$$;
