async function adminRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok || (data && data.ok === false)) {
    const error = new Error(data?.error || 'No fue posible completar la operación administrativa.');
    error.status = response.status;
    error.requiresReauth = Boolean(data?.requiresReauth);
    throw error;
  }

  return data;
}

export async function fetchAdminConsoleSummary() {
  const data = await adminRequest('/api/admin/console/summary');
  return data.summary;
}

export async function runAdminConsoleCommand(command) {
  const data = await adminRequest('/api/admin/console/command', {
    method: 'POST',
    body: JSON.stringify({ command }),
  });
  return data.result;
}

export async function reauthenticateAdmin(password) {
  const data = await adminRequest('/api/admin/security/reauth', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  return data;
}

export async function lockAdminElevation() {
  return adminRequest('/api/admin/security/lock', { method: 'POST' });
}

export async function fetchAdminSecurityStatus() {
  const data = await adminRequest('/api/admin/security/status');
  return data.security;
}

export async function clearAdminLoginBlocks() {
  return adminRequest('/api/admin/security/clear-login-blocks', { method: 'POST' });
}

export async function logoutOtherAdminSessions() {
  return adminRequest('/api/admin/security/logout-others', { method: 'POST' });
}

export async function fetchAdminSystemHealth() {
  const data = await adminRequest('/api/admin/system/health');
  return data.health;
}

export async function fetchAdminUsers() {
  const data = await adminRequest('/api/admin/users');
  return data.users;
}

export async function createAdminUser(payload) {
  const data = await adminRequest('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.user;
}

export async function updateAdminUser(id, payload) {
  const data = await adminRequest(`/api/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return data.user;
}

export async function resetAdminUserPassword(id, password) {
  const data = await adminRequest(`/api/admin/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  return data.user;
}

export async function fetchAdminEvents() {
  const data = await adminRequest('/api/admin/events');
  return data.events;
}

export async function createAdminEvent(payload) {
  const data = await adminRequest('/api/admin/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.event;
}

export async function updateAdminEvent(id, payload) {
  const data = await adminRequest(`/api/admin/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return data.event;
}

export async function fetchAdminTemplates() {
  const data = await adminRequest('/api/admin/templates');
  return data.templates;
}

export async function fetchAdminDocuments(limit = 100) {
  const data = await adminRequest(`/api/admin/documents?limit=${encodeURIComponent(limit)}`);
  return data.documents;
}

export async function fetchAdminAudit(limit = 100) {
  const data = await adminRequest(`/api/admin/audit?limit=${encodeURIComponent(limit)}`);
  return data.audit;
}
