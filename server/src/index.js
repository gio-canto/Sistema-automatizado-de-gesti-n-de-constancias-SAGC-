import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import argon2 from 'argon2';
import {
  checkDatabaseConnection,
  requireSupabase,
} from './config/supabase.js';
import {
  attachSessionCookie,
  clearElevation,
  clearOtherSessions,
  clearSession,
  createSession,
  elevateSession,
  getSessionSnapshot,
  requireAdmin,
  requireElevatedAdmin,
  requireSession,
  sessionPolicy,
} from './security/session-store.js';
import {
  clearAllLoginFailures,
  clearLoginFailures,
  getLoginSecuritySnapshot,
  loginThrottle,
  recordLoginFailure,
} from './security/login-guard.js';
import { getAdminConsoleSummary } from './services/admin/console.js';
import { executeAdminConsoleCommand } from './services/admin/command-console.js';
import {
  createAdminEvent,
  createAdminUser,
  getAdminSystemHealth,
  listAdminAudit,
  listAdminDocuments,
  listAdminEvents,
  listAdminTemplates,
  listAdminUsers,
  resetAdminUserPassword,
  updateAdminEvent,
  updateAdminUser,
} from './services/admin/operations.js';
const app = express();
const port = Number(process.env.PORT || 3001);

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

async function recordAudit(client, {
  userId,
  action,
  entity,
  entityId = null,
  ip = null,
  metadata = null,
}) {
  try {
    await client.from('auditoria').insert({
      id_usuario: userId,
      accion: action,
      entidad: entity,
      id_entidad: entityId,
      ip: ip || null,
      metadata,
    });
  } catch (error) {
    console.warn('No fue posible registrar auditoría:', error?.message || error);
  }
}

function adminError(res, error, fallback = 'No fue posible completar la operación administrativa.') {
  console.error('Error administrativo:', error);
  const message = error?.message || fallback;
  const status = /inválid|requer|permitid|caracter|contraseña/i.test(message) ? 400 : 503;
  return res.status(status).json({ ok: false, error: message });
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'sagc-api',
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/health/db', async (_req, res) => {
  try {
    const database = await checkDatabaseConnection();
    res.json({ ok: true, database });
  } catch (error) {
    console.error('Error de conexión con Supabase/PostgreSQL:', error);
    res.status(503).json({ ok: false, error: 'No fue posible conectar con Supabase/PostgreSQL.' });
  }
});

app.post('/api/auth/login', loginThrottle, async (req, res) => {
  const user = String(req.body?.user || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!user || !password) {
    return res.status(400).json({ ok: false, error: 'Ingrese su usuario y contraseña.' });
  }

  try {
    const client = requireSupabase();
    const { data: account, error } = await client
      .from('usuarios')
      .select('id_usuario,nombre,usuario,password_hash,permiso,foto_url,activo')
      .eq('usuario', user)
      .maybeSingle();

    if (error) throw error;

    if (!account || !account.activo) {
      recordLoginFailure(req);
      return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos.' });
    }

    const validPassword = await argon2.verify(account.password_hash, password);
    if (!validPassword) {
      recordLoginFailure(req);
      return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos.' });
    }

    clearLoginFailures(req);

    const publicUser = {
      id: account.id_usuario,
      nombre: account.nombre,
      usuario: account.usuario,
      permiso: account.permiso,
      foto: account.foto_url || null,
    };

    const { token } = createSession(publicUser);
    attachSessionCookie(res, token);

    await recordAudit(client, {
      userId: account.id_usuario,
      action: 'INICIO_SESION',
      entity: 'USUARIO',
      entityId: account.id_usuario,
      ip: req.ip,
    });

    return res.json({ ok: true, user: publicUser });
  } catch (error) {
    console.error('Error durante autenticación:', error);
    return res.status(503).json({ ok: false, error: 'El servicio de autenticación no está disponible.' });
  }
});

app.get('/api/auth/me', requireSession, (req, res) => {
  res.json({
    ok: true,
    user: req.sagcSession,
    elevated: req.sagcSession.elevatedUntil > Date.now(),
    elevatedUntil: req.sagcSession.elevatedUntil || null,
  });
});

app.post('/api/auth/logout', (req, res) => {
  clearSession(req, res);
  res.status(204).end();
});

app.use('/api/admin', requireSession, requireAdmin);

app.get('/api/admin/console/summary', async (_req, res) => {
  try {
    const summary = await getAdminConsoleSummary();
    return res.json({ ok: true, summary });
  } catch (error) {
    return adminError(res, error, 'No fue posible cargar el estado administrativo del sistema.');
  }
});

app.post('/api/admin/console/command', async (req, res) => {
  try {
    const summary = await getAdminConsoleSummary();
    const result = await executeAdminConsoleCommand(req.body?.command, {
      summary,
      session: req.sagcSession,
      currentToken: req.sagcSessionToken,
      elevated: Boolean(req.sagcSession.elevatedUntil > Date.now()),
      sessionSnapshot: getSessionSnapshot(req.sagcSessionToken),
      loginSecurity: getLoginSecuritySnapshot(),
    });

    if (result.audit) {
      const client = requireSupabase();
      await recordAudit(client, {
        userId: req.sagcSession.id,
        action: result.audit.action,
        entity: result.audit.entity,
        entityId: result.audit.entityId || null,
        ip: req.ip,
        metadata: result.audit.metadata || null,
      });
    }

    const { audit: _audit, ...publicResult } = result;
    return res.json({ ok: true, result: publicResult });
  } catch (error) {
    if (error?.code === 'ELEVATION_REQUIRED') {
      return res.status(428).json({ ok: false, error: error.message, requiresReauth: true });
    }
    if (['COMMAND_NOT_ALLOWED', 'COMMAND_EMPTY', 'COMMAND_TOO_LONG', 'COMMAND_SYNTAX', 'COMMAND_ARGUMENT', 'COMMAND_NOT_FOUND'].includes(error?.code)) {
      return res.status(400).json({ ok: false, error: error.message });
    }
    return adminError(res, error);
  }
});

app.post('/api/admin/security/reauth', async (req, res) => {
  const password = String(req.body?.password || '');
  if (!password) return res.status(400).json({ ok: false, error: 'Ingrese su contraseña.' });

  try {
    const client = requireSupabase();
    const { data: account, error } = await client
      .from('usuarios')
      .select('id_usuario,password_hash,activo,permiso')
      .eq('id_usuario', req.sagcSession.id)
      .maybeSingle();
    if (error) throw error;
    if (!account || !account.activo || account.permiso !== 'ADMIN') {
      return res.status(403).json({ ok: false, error: 'La cuenta ADMIN ya no está disponible.' });
    }

    const valid = await argon2.verify(account.password_hash, password);
    if (!valid) return res.status(401).json({ ok: false, error: 'Contraseña incorrecta.' });

    const elevatedUntil = elevateSession(req);
    await recordAudit(client, {
      userId: req.sagcSession.id,
      action: 'MODO_ELEVADO_ACTIVADO',
      entity: 'SEGURIDAD',
      ip: req.ip,
    });
    return res.json({ ok: true, elevatedUntil });
  } catch (error) {
    return adminError(res, error, 'No fue posible confirmar la contraseña.');
  }
});

app.post('/api/admin/security/lock', (req, res) => {
  clearElevation(req);
  res.json({ ok: true });
});

app.get('/api/admin/security/status', (req, res) => {
  res.json({
    ok: true,
    security: {
      elevated: req.sagcSession.elevatedUntil > Date.now(),
      elevatedUntil: req.sagcSession.elevatedUntil || null,
      policy: sessionPolicy,
      sessions: getSessionSnapshot(req.sagcSessionToken),
      login: getLoginSecuritySnapshot(),
    },
  });
});

app.post('/api/admin/security/clear-login-blocks', requireElevatedAdmin, async (req, res) => {
  const cleared = clearAllLoginFailures();
  const client = requireSupabase();
  await recordAudit(client, {
    userId: req.sagcSession.id,
    action: 'LIMPIAR_BLOQUEOS_LOGIN',
    entity: 'SEGURIDAD',
    ip: req.ip,
    metadata: { cleared },
  });
  res.json({ ok: true, cleared });
});

app.post('/api/admin/security/logout-others', requireElevatedAdmin, async (req, res) => {
  const removed = clearOtherSessions(req.sagcSessionToken);
  const client = requireSupabase();
  await recordAudit(client, {
    userId: req.sagcSession.id,
    action: 'CERRAR_OTRAS_SESIONES',
    entity: 'SEGURIDAD',
    ip: req.ip,
    metadata: { removed },
  });
  res.json({ ok: true, removed });
});

app.get('/api/admin/system/health', async (req, res) => {
  try {
    const health = await getAdminSystemHealth(
      getSessionSnapshot(req.sagcSessionToken),
      getLoginSecuritySnapshot()
    );
    return res.json({ ok: true, health });
  } catch (error) {
    return adminError(res, error, 'No fue posible consultar la salud del sistema.');
  }
});

app.get('/api/admin/users', async (_req, res) => {
  try {
    return res.json({ ok: true, users: await listAdminUsers() });
  } catch (error) {
    return adminError(res, error);
  }
});

app.post('/api/admin/users', requireElevatedAdmin, async (req, res) => {
  try {
    const user = await createAdminUser(req.body);
    const client = requireSupabase();
    await recordAudit(client, {
      userId: req.sagcSession.id,
      action: 'CREAR_USUARIO',
      entity: 'USUARIO',
      entityId: user.id_usuario,
      ip: req.ip,
      metadata: { permiso: user.permiso },
    });
    return res.status(201).json({ ok: true, user });
  } catch (error) {
    return adminError(res, error);
  }
});

app.patch('/api/admin/users/:id', requireElevatedAdmin, async (req, res) => {
  try {
    if (Number(req.params.id) === Number(req.sagcSession.id) && req.body?.activo === false) {
      return res.status(400).json({ ok: false, error: 'No puede desactivar su propia sesión administrativa.' });
    }
    if (
      Number(req.params.id) === Number(req.sagcSession.id) &&
      req.body?.permiso &&
      String(req.body.permiso).toUpperCase() !== 'ADMIN'
    ) {
      return res.status(400).json({ ok: false, error: 'No puede retirar su propio permiso ADMIN durante la sesión actual.' });
    }
    const user = await updateAdminUser(req.params.id, req.body);
    const client = requireSupabase();
    await recordAudit(client, {
      userId: req.sagcSession.id,
      action: 'ACTUALIZAR_USUARIO',
      entity: 'USUARIO',
      entityId: user.id_usuario,
      ip: req.ip,
      metadata: { fields: Object.keys(req.body || {}) },
    });
    return res.json({ ok: true, user });
  } catch (error) {
    return adminError(res, error);
  }
});

app.post('/api/admin/users/:id/reset-password', requireElevatedAdmin, async (req, res) => {
  try {
    const user = await resetAdminUserPassword(req.params.id, req.body?.password);
    const client = requireSupabase();
    await recordAudit(client, {
      userId: req.sagcSession.id,
      action: 'RESTABLECER_PASSWORD',
      entity: 'USUARIO',
      entityId: user.id_usuario,
      ip: req.ip,
    });
    return res.json({ ok: true, user });
  } catch (error) {
    return adminError(res, error);
  }
});

app.get('/api/admin/events', async (_req, res) => {
  try {
    return res.json({ ok: true, events: await listAdminEvents() });
  } catch (error) {
    return adminError(res, error);
  }
});

app.post('/api/admin/events', async (req, res) => {
  try {
    const event = await createAdminEvent(req.body, req.sagcSession.id);
    const client = requireSupabase();
    await recordAudit(client, {
      userId: req.sagcSession.id,
      action: 'CREAR_EVENTO',
      entity: 'EVENTO',
      entityId: event.id_evento,
      ip: req.ip,
    });
    return res.status(201).json({ ok: true, event });
  } catch (error) {
    return adminError(res, error);
  }
});

app.patch('/api/admin/events/:id', async (req, res) => {
  try {
    const event = await updateAdminEvent(req.params.id, req.body);
    const client = requireSupabase();
    await recordAudit(client, {
      userId: req.sagcSession.id,
      action: 'ACTUALIZAR_EVENTO',
      entity: 'EVENTO',
      entityId: event.id_evento,
      ip: req.ip,
      metadata: { fields: Object.keys(req.body || {}) },
    });
    return res.json({ ok: true, event });
  } catch (error) {
    return adminError(res, error);
  }
});

app.get('/api/admin/templates', async (_req, res) => {
  try {
    return res.json({ ok: true, templates: await listAdminTemplates() });
  } catch (error) {
    return adminError(res, error);
  }
});

app.get('/api/admin/documents', async (req, res) => {
  try {
    return res.json({ ok: true, documents: await listAdminDocuments(req.query.limit) });
  } catch (error) {
    return adminError(res, error);
  }
});

app.get('/api/admin/audit', async (req, res) => {
  try {
    return res.json({ ok: true, audit: await listAdminAudit(req.query.limit) });
  } catch (error) {
    return adminError(res, error);
  }
});

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'Ruta no encontrada.' });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
});

app.listen(port, async () => {
  console.log(`SAGC API disponible en http://localhost:${port}`);
  try {
    const info = await checkDatabaseConnection();
    console.log(`Supabase conectado · PostgreSQL · esquema ${info?.schema || 'public'}`);
  } catch {
    console.warn('La API inició, pero Supabase todavía no está disponible. Configura server/.env y ejecuta npm run db:check.');
  }
});