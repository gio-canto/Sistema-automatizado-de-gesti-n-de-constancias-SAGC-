-- SAGC · Catálogos iniciales para PostgreSQL / Supabase

insert into public.tipos_documento (clave, nombre, activo)
values
  ('CONSTANCIA', 'Constancia', true),
  ('DIPLOMA', 'Diploma', true),
  ('RECONOCIMIENTO', 'Reconocimiento', true),
  ('ACREDITACION', 'Acreditación', true),
  ('PERSONALIZADO', 'Otros / Personalizado', true)
on conflict (clave) do update
set
  nombre = excluded.nombre,
  activo = true;

-- 0 significa que todavía no se ha emitido ningún folio del año.
insert into public.contador_folios (anio, serie, ultimo_valor)
values (
  extract(year from current_date)::smallint,
  'A',
  0
)
on conflict (anio) do nothing;
