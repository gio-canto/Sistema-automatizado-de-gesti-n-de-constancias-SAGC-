import { useEffect, useMemo, useState } from 'react';
import {
  clearAdminLoginBlocks,
  fetchAdminAudit,
  fetchAdminDocuments,
  fetchAdminSecurityStatus,
  fetchAdminSystemHealth,
  fetchAdminTemplates,
  lockAdminElevation,
  logoutOtherAdminSessions,
} from '../../services/admin.js';
import { notify } from '../../lib/notify.js';

function formatDate(value) {
  if (!value) return 'Sin datos';
  try {
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return String(value);
  }
}

function Empty({ children }) {
  return <p className="apple-empty">{children}</p>;
}

export function AdminActivityView({ summary, onNavigate }) {
  return (
    <div className="apple-view">
      <header className="apple-view__hero"><div><span>GENERAL</span><h1>Actividad</h1><p>Vista rápida de lo que acaba de ocurrir en SAGC.</p></div><button className="apple-primary-pill" type="button" onClick={() => onNavigate('audit')}>Abrir auditoría</button></header>
      <section className="apple-panel">
        <div className="apple-panel__title"><div><span>ÚLTIMOS EVENTOS</span><h2>Actividad reciente</h2></div></div>
        <div className="apple-timeline">
          {(summary?.audit || []).map((item) => <div key={item.id_auditoria}><i /><div><strong>{item.accion}</strong><span>{item.entidad}{item.id_entidad ? ` #${item.id_entidad}` : ''}</span><small>{formatDate(item.fecha)}</small></div></div>)}
          {!(summary?.audit || []).length ? <Empty>Sin actividad reciente.</Empty> : null}
        </div>
      </section>
    </div>
  );
}

export function AdminTemplatesView({ demo, onSessionExpired }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(!demo);

  async function load() {
    if (demo) return setItems([{ id_plantilla: 1, nombre: 'Plantilla institucional', version: 1, modo: 'REUTILIZABLE', orientacion: 'HORIZONTAL', tamano: 'Carta', activo: true }]);
    setLoading(true);
    try { setItems(await fetchAdminTemplates()); }
    catch (error) { if (error.status === 401 || error.status === 403) return onSessionExpired?.(); notify.error('Plantillas', error.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [demo]);

  return <div className="apple-view"><header className="apple-view__hero"><div><span>GESTIÓN</span><h1>Plantillas</h1><p>Catálogo de formatos documentales disponibles para emisión.</p></div><button className="apple-primary-pill" type="button" onClick={load}>Actualizar</button></header><section className="apple-panel"><div className="apple-card-list">{loading ? <Empty>Cargando plantillas…</Empty> : items.map((item) => <article key={item.id_plantilla}><div className="apple-file-preview">▤</div><div><strong>{item.nombre}</strong><small>v{item.version} · {item.modo}</small><span>{item.orientacion} · {item.tamano}</span></div><b className={item.activo ? 'apple-state is-ok' : 'apple-state'}>{item.activo ? 'Activa' : 'Inactiva'}</b></article>)}{!loading && !items.length ? <Empty>No hay plantillas registradas.</Empty> : null}</div></section></div>;
}

export function AdminDocumentsView({ demo, onSessionExpired, onRegister }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(!demo);
  async function load() {
    if (demo) return setItems([{ id_constancia: 1, folio: '2026-A-0001', nombre_persona: 'Persona de demostración', estado: 'EMITIDA', fecha_emision: new Date().toISOString(), token_unico: '7f0c55ca-3ac5-49a0-8b86-98dd96cef072' }]);
    setLoading(true);
    try { setItems(await fetchAdminDocuments(150)); }
    catch (error) { if (error.status === 401 || error.status === 403) return onSessionExpired?.(); notify.error('Documentos', error.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [demo]);

  return <div className="apple-view"><header className="apple-view__hero"><div><span>GESTIÓN</span><h1>Documentos</h1><p>Consulta de emisiones por folio, estado y destinatario.</p></div><button className="apple-primary-pill" type="button" onClick={onRegister}>Registrar documento</button></header><section className="apple-panel"><div className="apple-table-wrap"><table className="apple-table"><thead><tr><th>Folio</th><th>Persona</th><th>Estado</th><th>Fecha</th><th>Token</th></tr></thead><tbody>{items.map((item) => <tr key={item.id_constancia}><td><strong>{item.folio}</strong></td><td>{item.nombre_persona}</td><td><span className={`apple-state ${item.estado === 'EMITIDA' ? 'is-ok' : ''}`}>{item.estado}</span></td><td>{formatDate(item.fecha_emision)}</td><td><code>{String(item.token_unico || '').slice(0, 8)}…</code></td></tr>)}</tbody></table>{loading ? <Empty>Cargando documentos…</Empty> : null}{!loading && !items.length ? <Empty>No hay documentos registrados.</Empty> : null}</div></section></div>;
}

export function AdminAuditView({ demo, onSessionExpired }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(!demo);
  async function load() {
    if (demo) return setItems([{ id_auditoria: 1, accion: 'INICIO_SESION', entidad: 'USUARIO', id_entidad: 1, fecha: new Date().toISOString(), ip: '127.0.0.1' }]);
    setLoading(true);
    try { setItems(await fetchAdminAudit(200)); }
    catch (error) { if (error.status === 401 || error.status === 403) return onSessionExpired?.(); notify.error('Auditoría', error.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [demo]);

  return <div className="apple-view"><header className="apple-view__hero"><div><span>CONTROL</span><h1>Auditoría</h1><p>Trazabilidad de operaciones administrativas y eventos sensibles.</p></div><button className="apple-primary-pill" type="button" onClick={load}>Actualizar</button></header><section className="apple-panel"><div className="apple-table-wrap"><table className="apple-table"><thead><tr><th>Acción</th><th>Entidad</th><th>Usuario</th><th>IP</th><th>Fecha</th></tr></thead><tbody>{items.map((item) => <tr key={item.id_auditoria}><td><strong>{item.accion}</strong></td><td>{item.entidad}{item.id_entidad ? ` #${item.id_entidad}` : ''}</td><td>{item.id_usuario || 'Sistema'}</td><td><code>{item.ip || '—'}</code></td><td>{formatDate(item.fecha)}</td></tr>)}</tbody></table>{loading ? <Empty>Cargando auditoría…</Empty> : null}{!loading && !items.length ? <Empty>No hay registros de auditoría.</Empty> : null}</div></section></div>;
}

export function AdminSystemView({ demo, onSessionExpired }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(!demo);
  async function load() {
    if (demo) return setHealth({ api: { status: 'demo', node: 'N/A', environment: 'GitHub Pages', uptimeSeconds: 0, memory: {} }, database: { provider: 'Supabase', database: 'PostgreSQL', schema: 'public' }, sessions: { total: 0, admins: 0, elevated: 0 } });
    setLoading(true);
    try { setHealth(await fetchAdminSystemHealth()); }
    catch (error) { if (error.status === 401 || error.status === 403) return onSessionExpired?.(); notify.error('Sistema', error.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [demo]);

  const memoryMb = useMemo(() => Math.round((health?.api?.memory?.rss || 0) / 1024 / 1024), [health]);
  return <div className="apple-view"><header className="apple-view__hero"><div><span>CONTROL</span><h1>Sistema</h1><p>Estado técnico de la API, PostgreSQL y sesiones activas.</p></div><button className="apple-primary-pill" type="button" onClick={load}>Diagnosticar</button></header><div className="apple-metric-grid"><article><span>API</span><strong>{loading ? '…' : health?.api?.status || '—'}</strong><small>{health?.api?.environment || '—'}</small></article><article><span>Node.js</span><strong>{health?.api?.node || '—'}</strong><small>{health?.api?.uptimeSeconds || 0}s uptime</small></article><article><span>Memoria RSS</span><strong>{memoryMb} MB</strong><small>proceso API</small></article><article><span>Sesiones</span><strong>{health?.sessions?.total ?? 0}</strong><small>{health?.sessions?.elevated ?? 0} elevadas</small></article></div><section className="apple-panel"><div className="apple-system-grid"><div><span>Proveedor</span><strong>{health?.database?.provider || '—'}</strong></div><div><span>Base</span><strong>{health?.database?.database || '—'}</strong></div><div><span>Esquema</span><strong>{health?.database?.schema || '—'}</strong></div><div><span>Administradores conectados</span><strong>{health?.sessions?.admins ?? 0}</strong></div></div></section></div>;
}

export function AdminSecurityView({ demo, elevated, onUnlock, onLock, onSessionExpired }) {
  const [security, setSecurity] = useState(null);
  const [loading, setLoading] = useState(!demo);
  async function load() {
    if (demo) return setSecurity({ elevated, elevatedUntil: null, policy: { sessionHours: 8, elevatedMinutes: 10 }, sessions: { total: 1, admins: 1, elevated: elevated ? 1 : 0, sessions: [] }, login: { windowMinutes: 15, maxFailures: 8, tracked: 0, blocked: 0, entries: [] } });
    setLoading(true);
    try { setSecurity(await fetchAdminSecurityStatus()); }
    catch (error) { if (error.status === 401 || error.status === 403) return onSessionExpired?.(); notify.error('Seguridad', error.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [demo, elevated]);

  async function sensitive(action) {
    if (!elevated && !demo) return onUnlock?.(action);
    await action();
  }

  async function clearBlocks() {
    await sensitive(async () => {
      try { if (!demo) await clearAdminLoginBlocks(); notify.success('Bloqueos limpiados'); await load(); } catch (error) { notify.error('Seguridad', error.message); }
    });
  }
  async function logoutOthers() {
    await sensitive(async () => {
      try { const result = demo ? { removed: 0 } : await logoutOtherAdminSessions(); notify.success('Sesiones cerradas', `${result.removed || 0} sesiones finalizadas.`); await load(); } catch (error) { notify.error('Seguridad', error.message); }
    });
  }
  async function lock() {
    if (!demo) await lockAdminElevation();
    onLock?.();
    await load();
  }

  return <div className="apple-view"><header className="apple-view__hero"><div><span>CONTROL</span><h1>Seguridad</h1><p>Reautenticación, sesiones y protección ante intentos fallidos.</p></div><span className={`apple-secure-badge ${elevated ? 'is-unlocked' : ''}`}>{elevated ? 'Modo elevado activo' : 'Modo protegido'}</span></header><div className="apple-metric-grid"><article><span>Sesiones</span><strong>{loading ? '…' : security?.sessions?.total ?? 0}</strong><small>{security?.sessions?.admins ?? 0} ADMIN</small></article><article><span>Elevadas</span><strong>{security?.sessions?.elevated ?? 0}</strong><small>{security?.policy?.elevatedMinutes || 10} min</small></article><article><span>Intentos vigilados</span><strong>{security?.login?.tracked ?? 0}</strong><small>ventana {security?.login?.windowMinutes || 15} min</small></article><article><span>Bloqueados</span><strong>{security?.login?.blocked ?? 0}</strong><small>máx. {security?.login?.maxFailures || 8} fallos</small></article></div><section className={`apple-panel apple-sensitive-zone ${elevated || demo ? 'is-unlocked' : ''}`}><div className="apple-panel__title"><div><span>ZONA SENSIBLE</span><h2>Controles administrativos</h2></div></div><div className="apple-security-actions"><button type="button" onClick={clearBlocks}><strong>Limpiar bloqueos de login</strong><span>Restablece los contadores temporales de intentos fallidos.</span></button><button type="button" onClick={logoutOthers}><strong>Cerrar otras sesiones</strong><span>Mantiene únicamente esta sesión administrativa.</span></button><button type="button" onClick={elevated ? lock : onUnlock}><strong>{elevated ? 'Bloquear modo elevado' : 'Desbloquear modo elevado'}</strong><span>Las acciones sensibles vuelven a requerir contraseña.</span></button></div>{!elevated && !demo ? <button className="apple-sensitive-zone__lock" type="button" onClick={onUnlock}>⌾<strong>Zona protegida</strong><span>Confirma tu contraseña para continuar</span></button> : null}</section></div>;
}

export function AdminSettingsView({ appearance, density, onAppearance, onDensity }) {
  return <div className="apple-view"><header className="apple-view__hero"><div><span>PREFERENCIAS</span><h1>Configuración</h1><p>Ajustes locales de la experiencia administrativa. No modifica secretos ni infraestructura.</p></div></header><section className="apple-panel"><div className="apple-settings-list"><label><div><strong>Apariencia</strong><span>Estilo visual de esta consola.</span></div><select value={appearance} onChange={(e) => onAppearance(e.target.value)}><option value="light">Claro</option><option value="dark">Oscuro</option></select></label><label><div><strong>Densidad</strong><span>Espaciado de tablas y paneles.</span></div><select value={density} onChange={(e) => onDensity(e.target.value)}><option value="comfortable">Cómoda</option><option value="compact">Compacta</option></select></label><div><div><strong>Política de seguridad</strong><span>Sesiones elevadas son temporales y las cookies son HttpOnly.</span></div><b>Protegido</b></div><div><div><strong>Secretos</strong><span>SUPABASE_SECRET_KEY permanece exclusivamente en el backend.</span></div><b>No expuestos</b></div></div></section></div>;
}

export function AdminSupportView() {
  return <div className="apple-view"><header className="apple-view__hero"><div><span>PREFERENCIAS</span><h1>Soporte</h1><p>Comandos y rutas útiles para desarrollar SAGC sin procesos automáticos ocultos.</p></div></header><section className="apple-panel"><div className="apple-support-grid"><article><span>Frontend</span><code>npm run dev</code><small>Vite · http://localhost:5173</small></article><article><span>Backend</span><code>npm run server:dev</code><small>Express · http://localhost:3001</small></article><article><span>Base de datos</span><code>npm run db:check</code><small>Comprueba Supabase/PostgreSQL</small></article><article><span>Calidad React</span><code>npm run doctor</code><small>React Doctor manual</small></article></div></section><section className="apple-panel"><div className="apple-panel__title"><div><span>DOCUMENTACIÓN</span><h2>Guías del proyecto</h2></div></div><div className="apple-doc-links"><code>docs/GUIA_HERRAMIENTAS_COMPONENTES_UI.md</code><code>docs/GUIA_MENU_ROLES.md</code><code>docs/GUIA_CONSOLA_ADMIN.md</code><code>docs/SUPABASE_POSTGRES.md</code></div></section></div>;
}
