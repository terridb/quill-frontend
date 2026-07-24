-- Run in Supabase SQL editor before deploying the app change.
-- Seeds list_entries.page_count from books.page_count (catalog estimate).

alter table public.list_entries
  add column if not exists page_count integer;

do $$
begin
  alter table public.list_entries
    add constraint list_entries_page_count_check
    check (page_count is null or page_count > 0);
exception
  when duplicate_object then null;
end $$;

update public.list_entries le
set page_count = b.page_count
from public.books b
where le.book_id = b.id
  and le.page_count is null
  and b.page_count is not null;
