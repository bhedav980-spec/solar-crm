create table if not exists public.crm_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  owner_id uuid not null default auth.uid(),
  updated_at timestamptz not null default now()
);

alter table public.crm_state add column if not exists owner_id uuid;
update public.crm_state set owner_id = 'a0994734-0a44-4bad-8204-68469d916b33' where id = 'main';
alter table public.crm_state enable row level security;

drop policy if exists "crm_state_select" on public.crm_state;
drop policy if exists "crm_state_insert" on public.crm_state;
drop policy if exists "crm_state_update" on public.crm_state;
drop policy if exists "Owner reads CRM" on public.crm_state;
drop policy if exists "Owner inserts CRM" on public.crm_state;
drop policy if exists "Owner updates CRM" on public.crm_state;

create policy "Owner reads CRM" on public.crm_state for select to authenticated
using (auth.uid() = owner_id);
create policy "Owner inserts CRM" on public.crm_state for insert to authenticated
with check (auth.uid() = 'a0994734-0a44-4bad-8204-68469d916b33');
create policy "Owner updates CRM" on public.crm_state for update to authenticated
using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

insert into storage.buckets (id, name, public)
values ('customer-documents', 'customer-documents', false)
on conflict (id) do update set public = false;

drop policy if exists "Owner document read" on storage.objects;
drop policy if exists "Owner document upload" on storage.objects;
drop policy if exists "Owner document update" on storage.objects;
drop policy if exists "Owner document delete" on storage.objects;

create policy "Owner document read" on storage.objects for select to authenticated
using (bucket_id = 'customer-documents' and auth.uid() = 'a0994734-0a44-4bad-8204-68469d916b33');
create policy "Owner document upload" on storage.objects for insert to authenticated
with check (bucket_id = 'customer-documents' and auth.uid() = 'a0994734-0a44-4bad-8204-68469d916b33');
create policy "Owner document update" on storage.objects for update to authenticated
using (bucket_id = 'customer-documents' and auth.uid() = 'a0994734-0a44-4bad-8204-68469d916b33');
create policy "Owner document delete" on storage.objects for delete to authenticated
using (bucket_id = 'customer-documents' and auth.uid() = 'a0994734-0a44-4bad-8204-68469d916b33');
