const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const attempts = new Map();

function keyFor(req, username) {
  return `${req.ip || 'unknown'}:${String(username || '').toLowerCase()}`;
}

function currentEntry(key) {
  const entry = attempts.get(key);
  if (!entry) return null;
  if (Date.now() - entry.startedAt > WINDOW_MS) {
    attempts.delete(key);
    return null;
  }
  return entry;
}

function cleanupExpired() {
  for (const key of attempts.keys()) currentEntry(key);
}

export function loginThrottle(req, res, next) {
  const key = keyFor(req, req.body?.user);
  const entry = currentEntry(key);

  if (entry && entry.failures >= MAX_FAILURES) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((WINDOW_MS - (Date.now() - entry.startedAt)) / 1000)
    );
    res.setHeader('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({
      ok: false,
      error: 'Demasiados intentos fallidos. Espere antes de volver a intentar.',
    });
  }

  req.sagcLoginKey = key;
  next();
}

export function recordLoginFailure(req) {
  const key = req.sagcLoginKey || keyFor(req, req.body?.user);
  const entry = currentEntry(key);

  if (!entry) {
    attempts.set(key, { failures: 1, startedAt: Date.now() });
    return;
  }

  entry.failures += 1;
}

export function clearLoginFailures(req) {
  const key = req.sagcLoginKey || keyFor(req, req.body?.user);
  attempts.delete(key);
}

export function getLoginSecuritySnapshot() {
  cleanupExpired();
  const now = Date.now();
  const entries = Array.from(attempts.entries()).map(([key, entry]) => ({
    key,
    failures: entry.failures,
    blocked: entry.failures >= MAX_FAILURES,
    retryAfterSeconds: Math.max(
      0,
      Math.ceil((WINDOW_MS - (now - entry.startedAt)) / 1000)
    ),
  }));

  return {
    windowMinutes: WINDOW_MS / 60000,
    maxFailures: MAX_FAILURES,
    tracked: entries.length,
    blocked: entries.filter((entry) => entry.blocked).length,
    entries,
  };
}

export function clearAllLoginFailures() {
  const count = attempts.size;
  attempts.clear();
  return count;
}
