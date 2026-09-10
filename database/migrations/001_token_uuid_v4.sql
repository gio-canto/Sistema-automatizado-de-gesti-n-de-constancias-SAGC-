-- SAGC · Migración PostgreSQL 001
-- Adopta Token Único SAGC V1 basado en UUID versión 4.
--
-- Ejecutar únicamente si public.constancias ya existe con token_unico
-- almacenado como texto.

begin;

do $$
begin
  if exists (
    select 1
    from public.constancias
    where lower(token_unico::text) !~
      '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ) then
    raise exception
      'TOKEN_UUID_V4_MIGRATION_ABORTED: existen token_unico que no son UUIDv4 válidos';
  end if;
end;
$$;

alter table public.constancias
  alter column token_unico type uuid
  using lower(token_unico::text)::uuid;

alter table public.constancias
  drop constraint if exists chk_constancias_token_uuid_v4;

alter table public.constancias
  add constraint chk_constancias_token_uuid_v4
  check (
    token_unico::text ~
    '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  );

commit;

select
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'constancias'
  and column_name = 'token_unico';
