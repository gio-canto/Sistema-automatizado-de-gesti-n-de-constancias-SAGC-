import {
  listAdminAudit,
  listAdminDocuments,
  listAdminEvents,
  listAdminTemplates,
  listAdminUsers,
  updateAdminEvent,
  updateAdminUser,
} from './operations.js';
import { clearAllLoginFailures, getLoginSecuritySnapshot } from '../../security/login-guard.js';
import { clearOtherSessions, getSessionSnapshot } from '../../security/session-store.js';

const HELP = [
  'help | commands',
  'status | health | whoami | date | uptime',
  'users.count',
  'users.list [--active] [--admins] [--limit N]',
  'users.show <id|usuario>',
  'user.enable <id> *',
  'user.disable <id> *',
  'user.role <id> <ADMIN|NORMAL> *',
  'events.count',
  'events.list [--state ESTADO] [--limit N]',
  'events.show <id|codigo>',
  'event.state <id> <BORRADOR|ACTIVO|CERRADO|CANCELADO> *',
  'templates.list [--active] [--limit N]',
  'documents.list [--state ESTADO] [--limit N]',
  'documents.show <folio|uuid>',
  'folios.current',
  'audit.latest [--limit N]',
  'security.status',
  'sessions.list',
  'security.clear-login-blocks *',
  'security.logout-others *',
  '',
  '* requiere modo elevado.',
  'Atajos locales: clear, Ctrl+L, ↑/↓ historial, Tab autocompleta.',
  'No se admiten shell, SQL, redirecciones, pipes ni operadores de sistema.',
];

function commandError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function tokenize(rawValue) {
  const raw = String(rawValue || '').trim();
  if (!raw) throw commandError('COMMAND_EMPTY', 'Escriba un comando.');
  if (raw.length > 500) throw commandError('COMMAND_TOO_LONG', 'El comando supera el límite de 500 caracteres.');
  if (/\r|\n/.test(raw)) throw commandError('COMMAND_SYNTAX', 'Solo se permite un comando por ejecución.');
  if (/[;&|><`$]/.test(raw)) {
    throw commandError('COMMAND_SYNTAX', 'Operador no permitido. La consola SAGC no es un shell del sistema.');
  }

  const tokens = [];
  let current = '';
  let quote = null;
  let escaped = false;

  for (const char of raw) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (quote) {
      if (char === quote) quote = null;
      else current += char;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    current += char;
  }

  if (quote) throw commandError('COMMAND_SYNTAX', 'Hay una comilla sin cerrar.');
  if (escaped) current += '\\';
  if (current) tokens.push(current);
  if (!tokens.length) throw commandError('COMMAND_EMPTY', 'Escriba un comando.');
  return tokens;
}

function readLimit(args, fallback = 25, max = 100) {
  const inline = args.find((arg) => /^--limit=\d+$/i.test(arg));
  let value = inline ? Number(inline.split('=')[1]) : null;
  const index = args.findIndex((arg) => arg.toLowerCase() === '--limit');
  if (value === null && index !== -1) value = Number(args[index + 1]);
  if (!Number.isFinite(value)) value = fallback;
  return Math.min(max, Math.max(1, Math.floor(value)));
}

function hasFlag(args, flag) {
  return args.some((arg) => arg.toLowerCase() === flag.toLowerCase());
}

function readOption(args, name) {
  const prefix = `${name.toLowerCase()}=`;
  const inline = args.find((arg) => arg.toLowerCase().startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = args.findIndex((arg) => arg.toLowerCase() === name.toLowerCase());
  return index >= 0 ? args[index + 1] : null;
}

function requireElevated(context) {
  if (!context.elevated) {
    throw commandError('ELEVATION_REQUIRED', 'Este comando requiere modo elevado. Confirme su contraseña de administrador.');
  }
}

function requirePositiveId(value, label = 'ID') {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) throw commandError('COMMAND_ARGUMENT', `${label} inválido.`);
  return id;
}

function lineUser(user) {
  return `#${user.id_usuario} ${user.usuario} · ${user.nombre} · ${user.permiso} · ${user.activo ? 'ACTIVO' : 'INACTIVO'}`;
}

function lineEvent(event) {
  return `#${event.id_evento} ${event.codigo} · ${event.nombre} · ${event.estado}${event.lugar ? ` · ${event.lugar}` : ''}`;
}

function lineDocument(row) {
  return `${row.folio} · ${row.nombre_persona} · ${row.estado} · ${row.token_unico}`;
}

export async function executeAdminConsoleCommand(rawCommand, context) {
  const tokens = tokenize(rawCommand);
  const command = tokens.shift().toLowerCase();
  const args = tokens;
  const summary = context.summary;

  if (command === 'help' || command === 'commands') {
    return { command: rawCommand, title: 'Comandos SAGC disponibles', lines: HELP };
  }

  if (command === 'status') {
    return {
      command: rawCommand,
      title: 'Estado SAGC',
      lines: [
        `API: ${summary.system.api}`,
        `Entorno: ${summary.system.environment}`,
        `Base: ${summary.database.database} / ${summary.database.provider}`,
        `Usuarios activos: ${summary.metrics.usersActive}`,
        `Eventos activos: ${summary.metrics.eventsActive}`,
        `Constancias: ${summary.metrics.certificatesTotal}`,
      ],
    };
  }

  if (command === 'health') {
    return {
      command: rawCommand,
      title: 'Health check',
      lines: [
        'API: online',
        `PostgreSQL: ${summary.database.database ? 'conectado' : 'sin respuesta'}`,
        `Esquema: ${summary.database.schema}`,
        `Node: ${summary.system.node}`,
        `Uptime: ${summary.system.uptimeSeconds}s`,
      ],
    };
  }

  if (command === 'whoami') {
    return {
      command: rawCommand,
      title: 'Sesión actual',
      lines: [
        `Usuario: ${context.session.usuario}`,
        `Nombre: ${context.session.nombre}`,
        `Permiso: ${context.session.permiso}`,
        `Modo elevado: ${context.elevated ? 'sí' : 'no'}`,
      ],
    };
  }

  if (command === 'date') {
    return { command: rawCommand, title: 'Fecha del servidor', lines: [new Date().toISOString()] };
  }

  if (command === 'uptime') {
    return { command: rawCommand, title: 'Tiempo activo', lines: [`${summary.system.uptimeSeconds}s`] };
  }

  if (command === 'users.count') {
    return {
      command: rawCommand,
      title: 'Usuarios',
      lines: [
        `Total: ${summary.metrics.usersTotal}`,
        `Activos: ${summary.metrics.usersActive}`,
        `ADMIN activos: ${summary.metrics.adminsActive}`,
      ],
    };
  }

  if (command === 'users.list') {
    let rows = await listAdminUsers();
    if (hasFlag(args, '--active')) rows = rows.filter((row) => row.activo);
    if (hasFlag(args, '--admins')) rows = rows.filter((row) => row.permiso === 'ADMIN');
    rows = rows.slice(0, readLimit(args, 25, 100));
    return { command: rawCommand, title: `Usuarios (${rows.length})`, lines: rows.length ? rows.map(lineUser) : ['Sin resultados.'] };
  }

  if (command === 'users.show') {
    const target = String(args[0] || '').toLowerCase();
    if (!target) throw commandError('COMMAND_ARGUMENT', 'Uso: users.show <id|usuario>');
    const rows = await listAdminUsers();
    const row = rows.find((item) => String(item.id_usuario) === target || String(item.usuario).toLowerCase() === target);
    if (!row) throw commandError('COMMAND_NOT_FOUND', 'Usuario no encontrado.');
    return {
      command: rawCommand,
      title: `Usuario ${row.usuario}`,
      lines: [lineUser(row), `Creado: ${row.fecha_creacion}`, `Actualizado: ${row.fecha_actualizacion || '—'}`],
    };
  }

  if (command === 'user.enable' || command === 'user.disable') {
    requireElevated(context);
    const id = requirePositiveId(args[0], 'ID de usuario');
    if (id === Number(context.session.id) && command === 'user.disable') {
      throw commandError('COMMAND_ARGUMENT', 'No puede desactivar su propia sesión administrativa.');
    }
    const user = await updateAdminUser(id, { activo: command === 'user.enable' });
    return {
      command: rawCommand,
      title: command === 'user.enable' ? 'Usuario activado' : 'Usuario desactivado',
      lines: [lineUser(user)],
      audit: { action: command === 'user.enable' ? 'CONSOLA_ACTIVAR_USUARIO' : 'CONSOLA_DESACTIVAR_USUARIO', entity: 'USUARIO', entityId: id },
    };
  }

  if (command === 'user.role') {
    requireElevated(context);
    const id = requirePositiveId(args[0], 'ID de usuario');
    const role = String(args[1] || '').toUpperCase();
    if (!['ADMIN', 'NORMAL'].includes(role)) throw commandError('COMMAND_ARGUMENT', 'Uso: user.role <id> <ADMIN|NORMAL>');
    if (id === Number(context.session.id) && role !== 'ADMIN') {
      throw commandError('COMMAND_ARGUMENT', 'No puede retirar su propio permiso ADMIN durante la sesión actual.');
    }
    const user = await updateAdminUser(id, { permiso: role });
    return {
      command: rawCommand,
      title: 'Permiso actualizado',
      lines: [lineUser(user)],
      audit: { action: 'CONSOLA_CAMBIAR_PERMISO', entity: 'USUARIO', entityId: id, metadata: { permiso: role } },
    };
  }

  if (command === 'events.count') {
    return {
      command: rawCommand,
      title: 'Eventos',
      lines: [`Total: ${summary.metrics.eventsTotal}`, `Activos: ${summary.metrics.eventsActive}`],
    };
  }

  if (command === 'events.list') {
    let rows = await listAdminEvents();
    const state = readOption(args, '--state');
    if (state) rows = rows.filter((row) => row.estado === state.toUpperCase());
    rows = rows.slice(0, readLimit(args, 25, 100));
    return { command: rawCommand, title: `Eventos (${rows.length})`, lines: rows.length ? rows.map(lineEvent) : ['Sin resultados.'] };
  }

  if (command === 'events.show') {
    const target = String(args[0] || '').toLowerCase();
    if (!target) throw commandError('COMMAND_ARGUMENT', 'Uso: events.show <id|codigo>');
    const rows = await listAdminEvents();
    const row = rows.find((item) => String(item.id_evento) === target || String(item.codigo).toLowerCase() === target);
    if (!row) throw commandError('COMMAND_NOT_FOUND', 'Evento no encontrado.');
    return {
      command: rawCommand,
      title: `Evento ${row.codigo}`,
      lines: [lineEvent(row), `Inicio: ${row.fecha_inicio || '—'}`, `Fin: ${row.fecha_fin || '—'}`, `Responsable: ${row.id_responsable || '—'}`],
    };
  }

  if (command === 'event.state') {
    requireElevated(context);
    const id = requirePositiveId(args[0], 'ID de evento');
    const state = String(args[1] || '').toUpperCase();
    if (!['BORRADOR', 'ACTIVO', 'CERRADO', 'CANCELADO'].includes(state)) {
      throw commandError('COMMAND_ARGUMENT', 'Uso: event.state <id> <BORRADOR|ACTIVO|CERRADO|CANCELADO>');
    }
    const event = await updateAdminEvent(id, { estado: state });
    return {
      command: rawCommand,
      title: 'Estado de evento actualizado',
      lines: [lineEvent(event)],
      audit: { action: 'CONSOLA_CAMBIAR_ESTADO_EVENTO', entity: 'EVENTO', entityId: id, metadata: { estado: state } },
    };
  }

  if (command === 'templates.list') {
    let rows = await listAdminTemplates();
    if (hasFlag(args, '--active')) rows = rows.filter((row) => row.activo);
    rows = rows.slice(0, readLimit(args, 25, 100));
    return {
      command: rawCommand,
      title: `Plantillas (${rows.length})`,
      lines: rows.length ? rows.map((row) => `#${row.id_plantilla} ${row.nombre} · v${row.version} · ${row.modo} · ${row.activo ? 'ACTIVA' : 'INACTIVA'}`) : ['Sin resultados.'],
    };
  }

  if (command === 'documents.list') {
    let rows = await listAdminDocuments(readLimit(args, 25, 100));
    const state = readOption(args, '--state');
    if (state) rows = rows.filter((row) => row.estado === state.toUpperCase());
    return { command: rawCommand, title: `Documentos (${rows.length})`, lines: rows.length ? rows.map(lineDocument) : ['Sin resultados.'] };
  }

  if (command === 'documents.show') {
    const target = String(args[0] || '').toLowerCase();
    if (!target) throw commandError('COMMAND_ARGUMENT', 'Uso: documents.show <folio|uuid>');
    const rows = await listAdminDocuments(250);
    const row = rows.find((item) => String(item.folio).toLowerCase() === target || String(item.token_unico).toLowerCase() === target);
    if (!row) throw commandError('COMMAND_NOT_FOUND', 'Documento no encontrado dentro del límite de consulta.');
    return {
      command: rawCommand,
      title: row.folio,
      lines: [lineDocument(row), `Evento ID: ${row.id_evento}`, `Tipo ID: ${row.id_tipo_documento}`, `Emitido por: ${row.emitido_por}`, `Fecha: ${row.fecha_emision}`],
    };
  }

  if (command === 'folios.current') {
    return {
      command: rawCommand,
      title: 'Folio actual',
      lines: summary.folios.current
        ? [`Año: ${summary.folios.current.anio}`, `Serie: ${summary.folios.current.serie}`, `Último valor: ${summary.folios.current.ultimo_valor}`]
        : ['No existe contador para el año actual.'],
    };
  }

  if (command === 'audit.latest') {
    const rows = await listAdminAudit(readLimit(args, 15, 100));
    return {
      command: rawCommand,
      title: `Auditoría (${rows.length})`,
      lines: rows.length ? rows.map((row) => `#${row.id_auditoria} ${row.accion} · ${row.entidad}${row.id_entidad ? ` #${row.id_entidad}` : ''} · ${row.fecha}`) : ['Sin actividad.'],
    };
  }

  if (command === 'security.status') {
    const security = getLoginSecuritySnapshot();
    return {
      command: rawCommand,
      title: 'Seguridad',
      lines: [
        `Modo elevado: ${context.elevated ? 'activo' : 'bloqueado'}`,
        `Sesiones: ${context.sessionSnapshot.total}`,
        `Sesiones ADMIN: ${context.sessionSnapshot.admins}`,
        `Sesiones elevadas: ${context.sessionSnapshot.elevated}`,
        `Intentos vigilados: ${security.tracked}`,
        `Bloqueos: ${security.blocked}`,
      ],
    };
  }

  if (command === 'sessions.list') {
    const rows = getSessionSnapshot(context.currentToken).sessions;
    return {
      command: rawCommand,
      title: `Sesiones (${rows.length})`,
      lines: rows.map((row) => `${row.current ? '*' : ' '} #${row.id} ${row.usuario} · ${row.permiso} · ${row.elevated ? 'ELEVADA' : 'normal'} · expira ${new Date(row.expiresAt).toISOString()}`),
    };
  }

  if (command === 'security.clear-login-blocks') {
    requireElevated(context);
    const cleared = clearAllLoginFailures();
    return {
      command: rawCommand,
      title: 'Bloqueos de login limpiados',
      lines: [`Entradas eliminadas: ${cleared}`],
      audit: { action: 'CONSOLA_LIMPIAR_BLOQUEOS_LOGIN', entity: 'SEGURIDAD', metadata: { cleared } },
    };
  }

  if (command === 'security.logout-others') {
    requireElevated(context);
    const removed = clearOtherSessions(context.currentToken);
    return {
      command: rawCommand,
      title: 'Otras sesiones cerradas',
      lines: [`Sesiones cerradas: ${removed}`],
      audit: { action: 'CONSOLA_CERRAR_OTRAS_SESIONES', entity: 'SEGURIDAD', metadata: { removed } },
    };
  }

  throw commandError('COMMAND_NOT_ALLOWED', `Comando no reconocido: ${command}. Use help para ver la lista permitida.`);
}
