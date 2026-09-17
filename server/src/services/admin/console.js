import {
  checkDatabaseConnection,
  requireSupabase,
} from '../../config/supabase.js';

async function countRows(client, table, applyFilters) {
  let query = client.from(table).select('*', { count: 'exact', head: true });
  if (applyFilters) query = applyFilters(query);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

async function latestConstancia(client) {
  const { data, error } = await client
    .from('constancias')
    .select('folio,nombre_persona,estado,fecha_emision')
    .order('fecha_emision', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function currentCounter(client) {
  const year = new Date().getFullYear();
  const { data, error } = await client
    .from('contador_folios')
    .select('anio,serie,ultimo_valor,fecha_actualizacion')
    .eq('anio', year)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function recentAudit(client) {
  const { data, error } = await client
    .from('auditoria')
    .select('id_auditoria,id_usuario,accion,entidad,id_entidad,fecha')
    .order('fecha', { ascending: false })
    .limit(8);

  if (error) throw error;
  return data ?? [];
}

export async function getAdminConsoleSummary() {
  const client = requireSupabase();

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
    countRows(client, 'usuarios'),
    countRows(client, 'usuarios', (q) => q.eq('activo', true)),
    countRows(client, 'usuarios', (q) => q.eq('activo', true).eq('permiso', 'ADMIN')),
    countRows(client, 'eventos'),
    countRows(client, 'eventos', (q) => q.eq('estado', 'ACTIVO')),
    countRows(client, 'plantillas', (q) => q.eq('activo', true)),
    countRows(client, 'constancias'),
    countRows(client, 'constancias', (q) => q.eq('estado', 'EMITIDA')),
    latestConstancia(client),
    currentCounter(client),
    recentAudit(client),
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
