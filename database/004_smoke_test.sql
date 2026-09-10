-- SAGC · Smoke test PostgreSQL / Supabase

select
  current_database() as base_actual,
  current_schema() as esquema_actual,
  version() as version_postgresql,
  now() as hora_servidor;

select public.sagc_healthcheck() as sagc_healthcheck;

select
  table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'usuarios',
    'tipos_documento',
    'eventos',
    'textos_evento',
    'campos_evento',
    'plantillas',
    'contador_folios',
    'constancias',
    'auditoria'
  )
order by table_name;

select
  id_tipo_documento,
  clave,
  nombre,
  activo
from public.tipos_documento
order by id_tipo_documento;

select
  anio,
  serie,
  ultimo_valor,
  case
    when ultimo_valor < 9999 then
      concat(anio, '-', serie, '-', lpad((ultimo_valor + 1)::text, 4, '0'))
    when serie < 'Z' then
      concat(anio, '-', chr(ascii(serie) + 1), '-0001')
    else
      'FOLIOS_AGOTADOS'
  end as siguiente_folio_estimado
from public.contador_folios
order by anio desc;

select
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
from information_schema.table_constraints tc
where tc.table_schema = 'public'
  and tc.table_name in (
    'usuarios',
    'tipos_documento',
    'eventos',
    'textos_evento',
    'campos_evento',
    'plantillas',
    'contador_folios',
    'constancias',
    'auditoria'
  )
order by tc.table_name, tc.constraint_type, tc.constraint_name;

-- Token Único SAGC V1 debe usar tipo PostgreSQL uuid.
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'constancias'
  and column_name = 'token_unico';

-- Debe existir la restricción específica UUIDv4.
select
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.constancias'::regclass
  and conname = 'chk_constancias_token_uuid_v4';
