import { checkDatabaseConnection, supabase } from '../../config/supabase.js';

async function countRows(table, applyFilters) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  if (applyFilters) query = applyFilters(query);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

async function latestConstancia() {
  const { data, error } = await supabase
    .from('constancias')
    .select('folio,nombre_persona,estado,fecha_emision')
    .order('fecha_emision', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function currentCounter() {
  const year = new Date().getFullYear();
  const { data, error } = await supabase
    .from('contador_folios')
    .select('anio,serie,ultimo_valor,fecha_actualizacion')
    .eq('anio', year)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function recentAudit() {
  const { data, error } = await supabase
    .from('auditoria')
    .select('id_auditoria,id_usuario,accion,entidad,id_entidad,fecha')
    .order('fecha', { ascending: false })
    .limit(8);

  if (error) throw error;
  return data ?? [];
}

export async function getAdminConsoleSummary() {
  const [
    database,
    usersTotal,
    usersActive,
    adminsActive,
    eventsTotal,
    eventsActive,
    templatesActive,
    certificatesTotal,
    certificatesIssued,
    latest,
    counter,
    audit,
  ] = await Promise.all([
    checkDatabaseConnection(),
    countRows('usuarios'),
    countRows('usuarios', (q) => q.eq('activo', true)),
    countRows('usuarios', (q) => q.eq('activo', true).eq('permiso', 'ADMIN')),
    countRows('eventos'),
    countRows('eventos', (q) => q.eq('estado', 'ACTIVO')),
    countRows('plantillas', (q) => q.eq('activo', true)),
    countRows('constancias'),
    countRows('constancias', (q) => q.eq('estado', 'EMITIDA')),
    latestConstancia(),
    currentCounter(),
    recentAudit(),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    system: {
      api: 'online',
      environment: process.env.NODE_ENV || 'development',
      node: process.version,
      uptimeSeconds: Math.round(process.uptime()),
    },
    database,
    metrics: {
      usersTotal,
      usersActive,
      adminsActive,
      eventsTotal,
      eventsActive,
      templatesActive,
      certificatesTotal,
      certificatesIssued,
    },
    folios: {
      current: counter,
      latestConstancia: latest,
    },
    audit,
  };
}
