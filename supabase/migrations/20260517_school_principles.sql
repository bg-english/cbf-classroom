-- ── school_principles — monthly guiding principles per school ────────────────
-- Each row = one principle for a given school + year + month.
-- The Capellán creates these; all teachers can read them.

create table if not exists school_principles (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references schools(id) on delete cascade,
  year        int  not null,
  month       int  not null check (month between 1 and 12),
  name        text not null,          -- e.g. "Principio de Pureza"
  verse_text  text not null default '',
  verse_ref   text not null default '',
  notes       text not null default '',
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint school_principles_unique unique (school_id, year, month)
);

-- ── principle_documents — Word / PDF uploads per principle ────────────────────
create table if not exists principle_documents (
  id             uuid primary key default gen_random_uuid(),
  principle_id   uuid not null references school_principles(id) on delete cascade,
  file_name      text not null,
  file_path      text not null,   -- path inside Storage bucket 'principle-docs'
  file_size      bigint,
  mime_type      text,
  uploaded_by    uuid references auth.users(id),
  created_at     timestamptz not null default now()
);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table school_principles  enable row level security;
alter table principle_documents enable row level security;

-- Authenticated users of the same school can read
create policy "principles_read" on school_principles
  for select using (auth.role() = 'authenticated');

-- Only admins / capellan can insert-update-delete (capellan role added later)
create policy "principles_write" on school_principles
  for all using (
    exists (
      select 1 from teachers
      where teachers.id = auth.uid()
        and teachers.school_id = school_principles.school_id
        and teachers.role in ('admin', 'capellan')
    )
  );

create policy "principle_docs_read" on principle_documents
  for select using (auth.role() = 'authenticated');

create policy "principle_docs_write" on principle_documents
  for all using (
    exists (
      select 1 from school_principles sp
      join teachers t on t.school_id = sp.school_id
      where sp.id = principle_documents.principle_id
        and t.id = auth.uid()
        and t.role in ('admin', 'capellan')
    )
  );

-- ── Storage bucket ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('principle-docs', 'principle-docs', true)
on conflict (id) do nothing;

create policy "principle_docs_storage_read" on storage.objects
  for select using (bucket_id = 'principle-docs');

create policy "principle_docs_storage_write" on storage.objects
  for insert with check (
    bucket_id = 'principle-docs' and auth.role() = 'authenticated'
  );

create policy "principle_docs_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'principle-docs' and auth.role() = 'authenticated'
  );
