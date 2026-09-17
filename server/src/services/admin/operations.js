import argon2 from 'argon2';
import { requireSupabase, checkDatabaseConnection } from '../../config/supabase.js';

function normalizeRole(value) {
  const role = String(value || 'NORMAL').trim().toUpperCase();
  if (!['NORMAL', 'ADMIN'].includes(role)) {
    throw new Error('Permiso inválido. Use NORMAL o ADMIN.');
  }
  return role;
}

function normalizeUsername(value) {
  const username = String(value || '').trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,100}$/.test(username)) {
    throw new Error('El usuario debe tener entre 3 y 100 caracteres y usar letras, números, punto, guion o guion bajo.');
  }
  return username;
}

function normalizePassword(value) {
  const password = String(value || '');
  if (password.length < 12) {
    throw new Error('La contraseña debe tener al menos 12 caracteres.');
  }
  return password;
}

export async function listAdminUsers() {
  const client = requireSupabase();
  const { data, error } = await client
    .from('usuarios')
    .select('id_usuario,nombre,usuario,permiso,foto_url,activo,fecha_creacion,fecha_actualizacion')
    .order('nombre', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createAdminUser(input) {
  const client = requireSupabase();
  const nombre = String(input?.nombre || '').trim();
  if (nombre.length < 3 || nombre.length > 180) throw new Error('Nombre inválido.');
  const usuario = normalizeUsername(input?.usuario);
  const permiso = normalizeRole(input?.permiso);
  const password = normalizePassword(input?.password);
  const password_hash = await argon2.hash(password, { type: argon2.argon2id });

  const { data, error } = await client
    .from('usuarios')
    .insert({ nombre, usuario, permiso, password_hash, activo: true })
    .select('id_usuario,nombre,usuario,permiso,foto_url,activo,fecha_creacion,fecha_actualizacion')
    .single();
  if (error) throw error;
  return data;
}

export async function updateAdminUser(id, patch) {
  const client = requireSupabase();
  const userId = Number(id);
  if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error('Usuario inválido.');

  const allowed = {};
  if (patch?.nombre !== undefined) {
    const nombre = String(patch.nombre).trim();
    if (nombre.length < 3 || nombre.length > 180) throw new Error('Nombre inválido.');
    allowed.nombre = nombre;
  }
  if (patch?.permiso !== undefined) allowed.permiso = normalizeRole(patch.permiso);
  if (patch?.activo !== undefined) allowed.activo = Boolean(patch.activo);
  if (!Object.keys(allowed).length) throw new Error('No hay cambios permitidos.');

  const { data, error } = await client
    .from('usuarios')
    .update(allowed)
    .eq('id_usuario', userId)
    .select('id_usuario,nombre,usuario,permiso,foto_url,activo,fecha_creacion,fecha_actualizacion')
    .single();
  if (error) throw error;
  return data;
}

export async function resetAdminUserPassword(id, passwordValue) {
  const client = requireSupabase();
  const userId = Number(id);
  if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error('Usuario inválido.');
  const password = normalizePassword(passwordValue);
  const password_hash = await argon2.hash(password, { type: argon2.argon2id });
  const { data, error } = await client
    .from('usuarios')
    .update({ password_hash })
    .eq('id_usuario', userId)
    .select('id_usuario,nombre,usuario,permiso,activo')
    .single();
  if (error) throw error;
  return data;
}

export async function listAdminEvents() {
  const client = requireSupabase();
  const { data, error } = await client
    .from('eventos')
    .select('id_evento,codigo,nombre,lugar,fecha_inicio,fecha_fin,estado,creado_por,id_responsable,fecha_creacion,fecha_actualizacion')
    .order('fecha_creacion', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createAdminEvent(input, createdBy) {
  const client = requireSupabase();
  const nombre = String(input?.nombre || '').trim();
  const codigo = String(input?.codigo || '').trim().toUpperCase();
  if (nombre.length < 3 || nombre.length > 255) throw new Error('Nombre de evento inválido.');
  if (!/^[A-Z0-9._-]{2,80}$/.test(codigo)) throw new Error('Código de evento inválido.');

  const payload = {
    codigo,
    nombre,
    lugar: String(input?.lugar || '').trim() || null,
    fecha_inicio: input?.fecha_inicio || null,
    fecha_fin: input?.fecha_fin || null,
    estado: ['BORRADOR', 'ACTIVO'].includes(String(input?.estado || '').toUpperCase())
      ? String(input.estado).toUpperCase()
      : 'BORRADOR',
    creado_por: createdBy,
    id_responsable: input?.id_responsable ? Number(input.id_responsable) : null,
  };

  const { data, error } = await client
    .from('eventos')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateAdminEvent(id, patch) {
  const client = requireSupabase();
  const eventId = Number(id);
  if (!Number.isSafeInteger(eventId) || eventId <= 0) throw new Error('Evento inválido.');
  const allowed = {};
  for (const key of ['nombre', 'lugar', 'fecha_inicio', 'fecha_fin']) {
    if (patch?.[key] !== undefined) allowed[key] = patch[key] || null;
  }
  if (patch?.estado !== undefined) {
    const state = String(patch.estado).toUpperCase();
    if (!['BORRADOR', 'ACTIVO', 'CERRADO', 'CANCELADO'].includes(state)) throw new Error('Estado inválido.');
    allowed.estado = state;
  }
  if (patch?.id_responsable !== undefined) {
    allowed.id_responsable = patch.id_responsable ? Number(patch.id_responsable) : null;
  }
  if (!Object.keys(allowed).length) throw new Error('No hay cambios permitidos.');

  const { data, error } = await client
    .from('eventos')
    .update(allowed)
    .eq('id_evento', eventId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function listAdminAudit(limit = 100) {
  const client = requireSupabase();
  const safeLimit = Math.min(250, Math.max(1, Number(limit) || 100));
  const { data, error } = await client
    .from('auditoria')
    .select('id_auditoria,id_usuario,accion,entidad,id_entidad,ip,metadata,fecha')
    .order('fecha', { ascending: false })
    .limit(safeLimit);
  if (error) throw error;
  return data ?? [];
}

export async function getAdminSystemHealth(sessionSnapshot, loginSecurity) {
  const database = await checkDatabaseConnection();
  return {
    api: {
      status: 'online',
      node: process.version,
      environment: process.env.NODE_ENV || 'development',
      uptimeSeconds: Math.round(process.uptime()),
      memory: process.memoryUsage(),
    },
    database,
    sessions: sessionSnapshot,
    loginSecurity,
  };
}

export async function executeLimitedAdminCommand(command, context) {
  const normalized = String(command || '').trim().toLowerCase();
  const summary = context.summary;

  const commands = {
    status: () => ({
      title: 'Estado SAGC',
      lines: [
        `API: ${summary.system.api}`,
        `Entorno: ${summary.system.environment}`,
        `Base: ${summary.database.database} / ${summary.database.provider}`,
        `Usuarios activos: ${summary.metrics.usersActive}`,
        `Eventos activos: ${summary.metrics.eventsActive}`,
      ],
    }),
    health: () => ({
      title: 'Health check',
      lines: [
        `PostgreSQL: conectado`,
        `Esquema: ${summary.database.schema}`,
        `Uptime: ${summary.system.uptimeSeconds}s`,
      ],
    }),
    'users.count': () => ({ title: 'Usuarios', lines: [`Total: ${summary.metrics.usersTotal}`, `Activos: ${summary.metrics.usersActive}`, `ADMIN: ${summary.metrics.adminsActive}`] }),
    'events.count': () => ({ title: 'Eventos', lines: [`Total: ${summary.metrics.eventsTotal}`, `Activos: ${summary.metrics.eventsActive}`] }),
    'folios.current': () => ({
      title: 'Folio actual',
      lines: summary.folios.current
        ? [`Año: ${summary.folios.current.anio}`, `Serie: ${summary.folios.current.serie}`, `Último valor: ${summary.folios.current.ultimo_valor}`]
        : ['No existe contador para el año actual.'],
    }),
    'audit.latest': () => ({
      title: 'Auditoría reciente',
      lines: (summary.audit || []).slice(0, 5).map((row) => `${row.accion} · ${row.entidad} · ${row.fecha}`),
    }),
  };

  const handler = commands[normalized];
  if (!handler) {
    const error = new Error('Comando no permitido.');
    error.code = 'COMMAND_NOT_ALLOWED';
    throw error;
  }

  return { command: normalized, ...handler() };
}
