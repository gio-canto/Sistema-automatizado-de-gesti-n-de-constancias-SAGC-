import { useCallback, useEffect, useState } from 'react';
import AdminShell from '../components/admin/AdminShell.jsx';
import AdminDashboardView from '../components/admin/AdminDashboardView.jsx';
import AdminUsersView from '../components/admin/AdminUsersView.jsx';
import AdminEventsView from '../components/admin/AdminEventsView.jsx';
import LimitedConsolePanel from '../components/admin/LimitedConsolePanel.jsx';
import SecureActionModal from '../components/admin/SecureActionModal.jsx';
import {
  AdminActivityView,
  AdminAuditView,
  AdminDocumentsView,
  AdminSecurityView,
  AdminSettingsView,
  AdminSupportView,
  AdminSystemView,
  AdminTemplatesView,
} from '../components/admin/AdminDataViews.jsx';
import {
  fetchAdminConsoleSummary,
  lockAdminElevation,
  reauthenticateAdmin,
} from '../services/admin.js';
import { notify } from '../lib/notify.js';

function demoSummary() {
  return {
    generatedAt: new Date().toISOString(),
    system: { api: 'demo', environment: 'Prototipo local', node: 'Sin backend', uptimeSeconds: 0 },
    database: { provider: 'Supabase', database: 'PostgreSQL', schema: 'public', demo: true },
    metrics: { usersTotal: 2, usersActive: 2, adminsActive: 1, eventsTotal: 1, eventsActive: 1, templatesActive: 1, certificatesTotal: 1, certificatesIssued: 1 },
    folios: {
      current: { anio: new Date().getFullYear(), serie: 'A', ultimo_valor: 1 },
      latestConstancia: { folio: `${new Date().getFullYear()}-A-0001`, nombre_persona: 'Persona de demostración', estado: 'EMITIDA', fecha_emision: new Date().toISOString() },
    },
    audit: [
      { id_auditoria: 1, accion: 'INICIO_SESION', entidad: 'USUARIO', id_entidad: 1, fecha: new Date().toISOString() },
      { id_auditoria: 2, accion: 'CONSULTA_CONSOLA', entidad: 'SISTEMA', id_entidad: null, fecha: new Date(Date.now() - 90000).toISOString() },
    ],
  };
}

export default function AdminConsolePage({ user, initialSection = 'dashboard', onBack, onShortcut, onSessionExpired }) {
  const demo = String(user?.permiso || '').toUpperCase() === 'DEMO';
  const [active, setActive] = useState(initialSection);
  const [summary, setSummary] = useState(() => (demo ? demoSummary() : null));
  const [loading, setLoading] = useState(!demo);
  const [elevated, setElevated] = useState(false);
  const [elevatedUntil, setElevatedUntil] = useState(0);
  const [secureOpen, setSecureOpen] = useState(false);
  const [secureBusy, setSecureBusy] = useState(false);
  const [secureError, setSecureError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [appearance, setAppearance] = useState(() => localStorage.getItem('sagc-admin-appearance') || 'light');
  const [density, setDensity] = useState(() => localStorage.getItem('sagc-admin-density') || 'comfortable');

  useEffect(() => { setActive(initialSection); }, [initialSection]);

  const loadSummary = useCallback(async (announce = false) => {
    if (demo) {
      setSummary(demoSummary());
      if (announce) notify.info('Modo demostración', 'Se actualizaron los datos de ejemplo.');
      return;
    }
    setLoading(true);
    try {
      setSummary(await fetchAdminConsoleSummary());
      if (announce) notify.success('Consola actualizada');
    } catch (error) {
      if (error.status === 401 || error.status === 403) return onSessionExpired?.();
      notify.error('No se pudo cargar la consola', error.message);
    } finally {
      setLoading(false);
    }
  }, [demo, onSessionExpired]);

  useEffect(() => { loadSummary(false); }, [loadSummary]);

  useEffect(() => {
    if (!elevated || !elevatedUntil) return undefined;
    const remaining = elevatedUntil - Date.now();
    if (remaining <= 0) {
      setElevated(false);
      setElevatedUntil(0);
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setElevated(false);
      setElevatedUntil(0);
      notify.info('Modo elevado finalizado', 'Las acciones sensibles vuelven a estar bloqueadas.');
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [elevated, elevatedUntil]);

  function navigate(id) {
    if (id === 'sagc') return onShortcut?.('sagc');
    if (id === 'create-user') id = 'users';
    setActive(id);
  }

  function requireElevated(action = null) {
    if (elevated || demo) {
      if (action) action();
      return;
    }
    setPendingAction(action ? () => action : null);
    setSecureError('');
    setSecureOpen(true);
  }

  async function confirmElevation(password) {
    setSecureBusy(true);
    setSecureError('');
    try {
      if (demo) {
        if (password !== 'demo') throw new Error('En modo demo use la contraseña demo.');
        const until = Date.now() + 10 * 60 * 1000;
        setElevated(true);
        setElevatedUntil(until);
      } else {
        const result = await reauthenticateAdmin(password);
        setElevated(true);
        setElevatedUntil(Number(result.elevatedUntil || Date.now() + 10 * 60 * 1000));
      }
      setSecureOpen(false);
      notify.success('Modo elevado activado', 'Las acciones sensibles están disponibles temporalmente.');
      const action = pendingAction;
      setPendingAction(null);
      if (action) window.setTimeout(() => action(), 0);
      return true;
    } catch (error) {
      setSecureError(error.message || 'No fue posible confirmar la contraseña.');
      return false;
    } finally {
      setSecureBusy(false);
    }
  }

  async function lockElevation() {
    try { if (!demo) await lockAdminElevation(); } catch { /* la UI se bloquea aunque el backend ya no responda */ }
    setElevated(false);
    setElevatedUntil(0);
    setPendingAction(null);
    notify.info('Modo protegido', 'Las acciones sensibles requieren contraseña nuevamente.');
  }

  function changeAppearance(value) {
    setAppearance(value);
    localStorage.setItem('sagc-admin-appearance', value);
  }

  function changeDensity(value) {
    setDensity(value);
    localStorage.setItem('sagc-admin-density', value);
  }

  let content;
  if (active === 'dashboard') content = <AdminDashboardView summary={summary} loading={loading} user={user} onNavigate={navigate} onRefresh={() => loadSummary(true)} />;
  else if (active === 'activity') content = <AdminActivityView summary={summary} onNavigate={navigate} />;
  else if (active === 'console') content = (
    <div className="apple-view">
      <header className="apple-view__hero">
        <div>
          <span>GENERAL</span>
          <h1>Terminal administrativa</h1>
          <p>Escribe comandos directamente. La terminal es amplia, pero está delimitada al lenguaje SAGC: no ofrece shell, SQL libre, pipes, redirecciones ni acceso a secretos.</p>
        </div>
        <div className={`apple-secure-badge ${elevated ? 'is-unlocked' : ''}`}>
          {elevated ? 'Modo elevado activo' : 'Modo protegido'}
        </div>
      </header>
      <LimitedConsolePanel
        demo={demo}
        elevated={elevated}
        onRequireElevation={() => requireElevated()}
      />
    </div>
  );
  else if (active === 'users') content = <AdminUsersView demo={demo} elevated={elevated} onRequireElevated={requireElevated} onSessionExpired={onSessionExpired} />;
  else if (active === 'events') content = <AdminEventsView demo={demo} onSessionExpired={onSessionExpired} />;
  else if (active === 'templates') content = <AdminTemplatesView demo={demo} onSessionExpired={onSessionExpired} />;
  else if (active === 'documents') content = <AdminDocumentsView demo={demo} onSessionExpired={onSessionExpired} onRegister={() => onShortcut?.('sagc')} />;
  else if (active === 'audit') content = <AdminAuditView demo={demo} onSessionExpired={onSessionExpired} />;
  else if (active === 'system') content = <AdminSystemView demo={demo} onSessionExpired={onSessionExpired} />;
  else if (active === 'security') content = <AdminSecurityView demo={demo} elevated={elevated} onUnlock={requireElevated} onLock={lockElevation} onSessionExpired={onSessionExpired} />;
  else if (active === 'settings') content = <AdminSettingsView appearance={appearance} density={density} onAppearance={changeAppearance} onDensity={changeDensity} />;
  else content = <AdminSupportView />;

  return (
    <>
      <AdminShell active={active} onNavigate={navigate} user={user} elevated={elevated} onUnlock={() => requireElevated()} onLock={lockElevation} onBack={onBack} onLogout={onSessionExpired} appearance={appearance} density={density}>
        {content}
      </AdminShell>
      <SecureActionModal open={secureOpen} busy={secureBusy} error={secureError} onClose={() => { if (!secureBusy) { setSecureOpen(false); setPendingAction(null); } }} onConfirm={confirmElevation} />
    </>
  );
}