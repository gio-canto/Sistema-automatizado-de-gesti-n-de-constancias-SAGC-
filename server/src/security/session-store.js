import { randomBytes } from 'node:crypto';

const COOKIE_NAME = 'sagc_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const sessions = new Map();

function parseCookies(header = '') {
  return header
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((result, part) => {
      const separator = part.indexOf('=');
      if (separator === -1) return result;
      const key = part.slice(0, separator).trim();
      const value = part.slice(separator + 1).trim();
      result[key] = decodeURIComponent(value);
      return result;
    }, {});
}

function cookieBase(token, maxAgeSeconds) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}${secure}`;
}

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt <= now) sessions.delete(token);
  }
}

export function createSession(account) {
  cleanupExpiredSessions();
  const token = randomBytes(32).toString('base64url');
  const session = {
    id: account.id,
    nombre: account.nombre,
    usuario: account.usuario,
    permiso: account.permiso,
    foto: account.foto || null,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  sessions.set(token, session);
  return { token, session };
}

export function attachSessionCookie(res, token) {
  res.setHeader('Set-Cookie', cookieBase(token, Math.floor(SESSION_TTL_MS / 1000)));
}

export function clearSession(req, res) {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (token) sessions.delete(token);
  res.setHeader('Set-Cookie', cookieBase('', 0));
}

export function requireSession(req, res, next) {
  cleanupExpiredSessions();
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  const session = token ? sessions.get(token) : null;

  if (!session) {
    return res.status(401).json({
      ok: false,
      error: 'La sesión no existe o expiró. Inicie sesión nuevamente.',
    });
  }

  req.sagcSession = session;
  req.sagcSessionToken = token;
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.sagcSession || req.sagcSession.permiso !== 'ADMIN') {
    return res.status(403).json({
      ok: false,
      error: 'Esta operación requiere permisos de administrador.',
    });
  }

  next();
}

export function touchSession(req) {
  const token = req.sagcSessionToken;
  if (!token) return;
  const session = sessions.get(token);
  if (!session) return;
  session.expiresAt = Date.now() + SESSION_TTL_MS;
}
