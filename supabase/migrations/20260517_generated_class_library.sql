-- ─────────────────────────────────────────────────────────────────────────────
-- generated_class_library
-- Caches AI-generated content (verse comic strips, indicator questions, etc.)
-- keyed by plan + grade + date + content_type.
-- Avoids regenerating the same content on every class session.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists generated_class_library (
  id           uuid        primary key default gen_random_uuid(),
  plan_id      text        not null,
  grade        text        not null,
  class_date   text        not null,   -- YYYY-MM-DD
  content_key  text        not null,   -- 'verse_year_comic' | 'verse_month_comic' | 'verse_guide_comic' | 'indicator_questions'
  content_data jsonb       not null default '{}',
  created_at   timestamptz not null default now(),

  constraint generated_class_library_unique
    unique (plan_id, grade, class_date, content_key)
);

-- Index for fast lookups during class load
create index if not exists gcl_lookup_idx
  on generated_class_library (plan_id, grade, class_date);

-- RLS: authenticated users can manage records
alter table generated_class_library enable row level security;

create policy "Authenticated users can read class library"
  on generated_class_library for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert class library"
  on generated_class_library for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update class library"
  on generated_class_library for update
  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage bucket: class-library (public, for generated images)
-- ─────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('class-library', 'class-library', true)
on conflict (id) do nothing;

create policy "Public read for class library images"
  on storage.objects for select
  using (bucket_id = 'class-library');

create policy "Authenticated upload to class library"
  on storage.objects for insert
  with check (bucket_id = 'class-library' and auth.role() = 'authenticated');

create policy "Authenticated update class library"
  on storage.objects for update
  using (bucket_id = 'class-library' and auth.role() = 'authenticated');
