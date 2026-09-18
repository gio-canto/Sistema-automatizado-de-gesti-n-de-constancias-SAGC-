-- SAGC · Cap CAPTCHA Core
-- Replay protection y tokens de un solo uso para el widget Cap.
-- Ejecutar una vez en Supabase SQL Editor si la base ya existía antes de integrar Cap.

begin;

create table if not exists public.cap_nonces (
  signature text primary key,
  expires_at timestamptz not null,
  fecha_creacion timestamptz not null default now()
);

create index if not exists idx_cap_nonces_expires_at
  on public.cap_nonces (expires_at);

create table if not exists public.cap_tokens (
  token_key text primary key,
  expires_at timestamptz not null,
  fecha_creacion timestamptz not null default now()
);

create index if not exists idx_cap_tokens_expires_at
  on public.cap_tokens (expires_at);

alter table public.cap_nonces enable row level security;
alter table public.cap_tokens enable row level security;

revoke all on table public.cap_nonces, public.cap_tokens
  from anon, authenticated;

grant select, insert, delete on table public.cap_nonces, public.cap_tokens
  to service_role;

create or replace function public.sagc_cap_consume_nonce(
  p_signature text,
  p_expires_at timestamptz
)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  v_rows integer;
begin
  if p_signature is null or length(p_signature) < 16 then
    return false;
  end if;

  delete from public.cap_nonces
  where expires_at <= now();

  insert into public.cap_nonces (signature, expires_at)
  values (p_signature, p_expires_at)
  on conflict (signature) do nothing;

  get diagnostics v_rows = row_count;
  return v_rows = 1;
end;
$$;

create or replace function public.sagc_cap_store_token(
  p_token_key text,
  p_expires_at timestamptz
)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  v_rows integer;
begin
  if p_token_key is null or length(p_token_key) < 16 then
    return false;
  end if;

  delete from public.cap_tokens
  where expires_at <= now();

  insert into public.cap_tokens (token_key, expires_at)
  values (p_token_key, p_expires_at)
  on conflict (token_key) do nothing;

  get diagnostics v_rows = row_count;
  return v_rows = 1;
end;
$$;

create or replace function public.sagc_cap_consume_token(
  p_token_key text
)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  v_rows integer;
begin
  delete from public.cap_tokens
  where expires_at <= now();

  delete from public.cap_tokens
  where token_key = p_token_key
    and expires_at > now();

  get diagnostics v_rows = row_count;
  return v_rows = 1;
end;
$$;

revoke execute on function public.sagc_cap_consume_nonce(text, timestamptz)
  from public, anon, authenticated;
revoke execute on function public.sagc_cap_store_token(text, timestamptz)
  from public, anon, authenticated;
revoke execute on function public.sagc_cap_consume_token(text)
  from public, anon, authenticated;

grant execute on function public.sagc_cap_consume_nonce(text, timestamptz)
  to service_role;
grant execute on function public.sagc_cap_store_token(text, timestamptz)
  to service_role;
grant execute on function public.sagc_cap_consume_token(text)
  to service_role;

commit;
