import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAdminConsoleSummary } from '../services/admin.js';
import { notify } from '../lib/notify.js';

function ConsoleIcon({ type }) {
  const paths = {
    users: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M4 19c0-3 2-5 5-5s5 2 5 5M14 15c2.5 0 4 1.4 4 4"/></>,
    userPlus: <><circle cx="9" cy="8" r="3"/><path d="M4 19c0-3 2-5 5-5s5 2 5 5M18 6v8M14 10h8"/></>,
    event: <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
    template: <><path d="M5 3h14v18H5z"/><path d="M8 7h8M8 11h8M8 15h5"/></>,
    document: <><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></>,
    audit: <><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h5M8 17h7"/></>,
    refresh: <><path d="M20 6v6h-6"/><path d="M4 18v-6h6"/><path d="M18 9a7 7 0 0 0-12-2L4 12M6 15a7 7 0 0 0 12 2l2-5"/></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/></>,
    shield: <><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="m9 12 2 2 4-4"/></>,
    server: <><rect x="4" y="4" width="16" height="6" rx="2"/><rect x="4" y="14" width="16" height="6" rx="2"/><path d="M8 7h.01M8 17h.01"/></>,
    folio: <><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[type] || paths.server}
    </svg>
  );
}

function formatDate(value) {
  if (!value) return 'Sin datos';
  try {
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

function formatUptime(seconds = 0) {
  const total = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours) return `${hours} h ${minutes} min`;
  return `${minutes} min`;
}

function demoSummary() {
  return {
    generatedAt: new Date().toISOString(),
    system: {
      api: 'demo',
      environment: 'GitHub Pages',
      node: 'Sin backend',
      uptimeSeconds: 0,
    },
    database: {
      provider: 'Supabase',
      database: 'PostgreSQL',
      schema: 'public',
      demo: true,
    },
    metrics: {
      usersTotal: 0,
      usersActive: 0,
      adminsActive: 0,
      eventsTotal: 0,
      eventsActive: 0,
      templatesActive: 0,
      certificatesTotal: 0,
      certificatesIssued: 0,
    },
    folios: {
      current: null,
      latestConstancia: null,
    },
    audit: [],
  };
}

const shortcuts = [
  { id: 'users', label: 'Usuarios', detail: 'Administrar cuentas y permisos', icon: 'users' },
  { id: 'create-user', label: 'Crear usuario', detail: 'Alta rápida de una cuenta', icon: 'userPlus' },
  { id: 'events', label: 'Eventos', detail: 'Gestionar eventos y responsables', icon: 'event' },
  { id: 'templates', label: 'Plantillas', detail: 'Gestionar formatos documentales', icon: 'template' },
  { id: 'sagc', label: 'Registrar', detail: 'Ir a emisión de documentos', icon: 'document' },
  { id: 'audit', label: 'Auditoría', detail: 'Revisar actividad administrativa', icon: 'audit' },
];

export default function AdminConsolePage({ user, onBack, onShortcut, onSessionExpired }) {
  const isDemo = String(user?.permiso || '').toUpperCase() === 'DEMO';
  const [summary, setSummary] = useState(() => (isDemo ? demoSummary() : null));
  const [loading, setLoading] = useState(!isDemo);
  const [error, setError] = useState('');

  const load = useCallback(async (announce = false) => {
    if (isDemo) {
      setSummary(demoSummary());
      if (announce) notify.info('Modo demostración', 'La consola real requiere el backend autenticado.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminConsoleSummary();
      setSummary(data);
      if (announce) notify.success('Consola actualizada', 'El estado del sistema se volvió a consultar.');
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        notify.warning('Sesión administrativa finalizada', 'Inicie sesión nuevamente.');
        onSessionExpired?.();
        return;
      }
      const message = err?.message || 'No fue posible cargar la consola.';
      setError(message);
      notify.error('No se pudo actualizar la consola', message);
    } finally {
      setLoading(false);
    }
  }, [isDemo, onSessionExpired]);

  useEffect(() => {
    load(false);
  }, [load]);

  const metrics = useMemo(() => summary?.metrics || {}, [summary]);
  const statusOnline = Boolean(summary && !error);
  const currentFolio = summary?.folios?.current;
  const latest = summary?.folios?.latestConstancia;

  return (
    <section className="admin-console" aria-label="Consola administrativa SAGC">
      <div className="admin-console__toolbar">
        <button className="admin-console__back" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span> Admin
        </button>
        <div className="admin-console__secure">
          <ConsoleIcon type="shield" />
          <span>{isDemo ? 'Vista demo' : 'Sesión ADMIN protegida'}</span>
        </div>
      </div>

      <div className="admin-console__window">
        <header className="admin-console__titlebar">
          <div className="admin-console__traffic" aria-hidden="true">
            <span className="is-red" />
            <span className="is-yellow" />
            <span className="is-green" />
          </div>
          <div className="admin-console__title">
            <strong>Consola SAGC</strong>
            <span>Centro de control administrativo</span>
          </div>
          <button
            className={`admin-console__refresh ${loading ? 'is-loading' : ''}`}
            type="button"
            onClick={() => load(true)}
            disabled={loading}
            aria-label="Actualizar consola"
          >
            <ConsoleIcon type="refresh" />
          </button>
        </header>

        <div className="admin-console__hero">
          <div>
            <p className="admin-console__kicker">ADMINISTRACIÓN SEGURA</p>
            <h1>Hola, {user?.nombre || user?.usuario || 'Administrador'}</h1>
            <p>
              Estado operativo, accesos directos y actividad reciente sin exponer
              comandos del sistema ni credenciales.
            </p>
          </div>
          <div className={`admin-console__status ${statusOnline ? 'is-online' : 'is-error'}`}>
            <span />
            {loading ? 'Consultando…' : statusOnline ? 'Sistema disponible' : 'Revisión requerida'}
          </div>
        </div>

        {error ? (
          <div className="admin-console__error" role="alert">
            <strong>No se pudo leer el estado del sistema.</strong>
            <span>{error}</span>
            <button type="button" onClick={() => load(true)}>Reintentar</button>
          </div>
        ) : null}

        <div className="admin-console__status-grid">
          <article className="admin-status-card">
            <span className="admin-status-card__icon"><ConsoleIcon type="server" /></span>
            <div><small>API</small><strong>{summary?.system?.api || (loading ? 'Consultando' : '—')}</strong></div>
            <em>{summary?.system ? formatUptime(summary.system.uptimeSeconds) : '—'}</em>
          </article>
          <article className="admin-status-card">
            <span className="admin-status-card__icon"><ConsoleIcon type="database" /></span>
            <div><small>Base de datos</small><strong>{summary?.database?.database || (loading ? 'Consultando' : '—')}</strong></div>
            <em>{summary?.database?.provider || '—'}</em>
          </article>
          <article className="admin-status-card">
            <span className="admin-status-card__icon"><ConsoleIcon type="folio" /></span>
            <div><small>Serie actual</small><strong>{currentFolio ? `${currentFolio.anio}-${currentFolio.serie}` : 'Sin emisiones'}</strong></div>
            <em>{currentFolio ? String(currentFolio.ultimo_valor).padStart(4, '0') : '0000'}</em>
          </article>
        </div>

        <section className="admin-console__section">
          <div className="admin-console__section-title">
            <div><span>Resumen</span><h2>Actividad del sistema</h2></div>
            <small>{summary?.generatedAt ? `Actualizado ${formatDate(summary.generatedAt)}` : 'Cargando…'}</small>
          </div>

          <div className="admin-metrics-grid">
            <article><small>Usuarios activos</small><strong>{loading ? '…' : metrics.usersActive ?? 0}</strong><span>{metrics.adminsActive ?? 0} admin</span></article>
            <article><small>Eventos</small><strong>{loading ? '…' : metrics.eventsTotal ?? 0}</strong><span>{metrics.eventsActive ?? 0} activos</span></article>
            <article><small>Plantillas activas</small><strong>{loading ? '…' : metrics.templatesActive ?? 0}</strong><span>disponibles</span></article>
            <article><small>Constancias</small><strong>{loading ? '…' : metrics.certificatesTotal ?? 0}</strong><span>{metrics.certificatesIssued ?? 0} emitidas</span></article>
          </div>
        </section>

        <section className="admin-console__section">
          <div className="admin-console__section-title">
            <div><span>Accesos directos</span><h2>Herramientas frecuentes</h2></div>
          </div>
          <div className="admin-shortcuts-grid">
            {shortcuts.map((item) => (
              <button key={item.id} type="button" onClick={() => onShortcut?.(item.id)}>
                <span className="admin-shortcut__icon"><ConsoleIcon type={item.icon} /></span>
                <span><strong>{item.label}</strong><small>{item.detail}</small></span>
                <b aria-hidden="true">›</b>
              </button>
            ))}
          </div>
        </section>

        <div className="admin-console__columns">
          <section className="admin-console__section admin-console__section--compact">
            <div className="admin-console__section-title">
              <div><span>Folios</span><h2>Última emisión</h2></div>
            </div>
            {latest ? (
              <div className="admin-latest">
                <strong>{latest.folio}</strong>
                <span>{latest.nombre_persona}</span>
                <small>{latest.estado} · {formatDate(latest.fecha_emision)}</small>
              </div>
            ) : (
              <p className="admin-empty">Todavía no hay constancias registradas.</p>
            )}
          </section>

          <section className="admin-console__section admin-console__section--compact">
            <div className="admin-console__section-title">
              <div><span>Auditoría</span><h2>Actividad reciente</h2></div>
            </div>
            <div className="admin-audit-list">
              {(summary?.audit || []).length ? (
                summary.audit.map((entry) => (
                  <div key={entry.id_auditoria}>
                    <span className="admin-audit-list__dot" />
                    <span><strong>{entry.accion}</strong><small>{entry.entidad}{entry.id_entidad ? ` #${entry.id_entidad}` : ''}</small></span>
                    <time>{formatDate(entry.fecha)}</time>
                  </div>
                ))
              ) : (
                <p className="admin-empty">Sin actividad reciente para mostrar.</p>
              )}
            </div>
          </section>
        </div>

        <footer className="admin-console__footer">
          <span>Node {summary?.system?.node || '—'}</span>
          <span>{summary?.system?.environment || '—'}</span>
          <span>Esquema {summary?.database?.schema || '—'}</span>
        </footer>
      </div>
    </section>
  );
}
