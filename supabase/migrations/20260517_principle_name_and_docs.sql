-- Add principle_name to existing school_monthly_principles table
alter table school_monthly_principles
  add column if not exists principle_name text not null default '';

-- ── principle_documents — Word / PDF uploads per monthly principle ────────────
create table if not exists principle_documents (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references schools(id) on delete cascade,
  year            int  not null,
  month           int  not null check (month between 1 and 12),
  file_name       text not null,
  file_path       text not null,
  file_size       bigint,
  mime_type       text,
  uploaded_by     uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

alter table principle_documents enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'principle_documents' and policyname = 'principle_docs_read'
  ) then
    execute 'create policy principle_docs_read on principle_documents for select using (auth.role() = ''authenticated'')';
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'principle_documents' and policyname = 'principle_docs_write'
  ) then
    execute $p$create policy principle_docs_write on principle_documents for all using (
      exists (
        select 1 from teachers
        where teachers.id = auth.uid()
          and teachers.school_id = principle_documents.school_id
          and teachers.role in ('admin', 'capellan', 'superadmin')
      )
    )$p$;
  end if;
end $$;

-- ── Storage bucket ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('principle-docs', 'principle-docs', true)
on conflict (id) do nothing;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'objects' and policyname = 'principle_docs_storage_read' and schemaname = 'storage'
  ) then
    execute 'create policy principle_docs_storage_read on storage.objects for select using (bucket_id = ''principle-docs'')';
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'objects' and policyname = 'principle_docs_storage_write' and schemaname = 'storage'
  ) then
    execute 'create policy principle_docs_storage_write on storage.objects for insert with check (bucket_id = ''principle-docs'' and auth.role() = ''authenticated'')';
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'objects' and policyname = 'principle_docs_storage_delete' and schemaname = 'storage'
  ) then
    execute 'create policy principle_docs_storage_delete on storage.objects for delete using (bucket_id = ''principle-docs'' and auth.role() = ''authenticated'')';
  end if;
end $$;
