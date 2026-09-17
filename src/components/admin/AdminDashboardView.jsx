function formatDate(value) {
  if (!value) return 'Sin datos';
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

const quick = [
  ['users', 'Usuarios', 'Gestionar cuentas y permisos', '◎'],
  ['events', 'Eventos', 'Crear y administrar eventos', '◫'],
  ['templates', 'Plantillas', 'Revisar formatos activos', '▤'],
  ['documents', 'Documentos', 'Consultar emisiones recientes', '▱'],
  ['audit', 'Auditoría', 'Trazabilidad administrativa', '≣'],
  ['security', 'Seguridad', 'Sesiones y acceso elevado', '◇'],
];

export default function AdminDashboardView({ summary, loading, user, onNavigate, onRefresh }) {
  const metrics = summary?.metrics || {};
  const current = summary?.folios?.current;
  const latest = summary?.folios?.latestConstancia;

  return (
    <div className="apple-view">
      <header className="apple-view__hero">
        <div><span>ADMIN CONSOLE</span><h1>Hola, {user?.nombre?.split(' ')[0] || 'Administrador'}</h1><p>Todo SAGC desde un único centro de control, con operaciones administrativas limitadas y auditables.</p></div>
        <button className="apple-primary-pill" type="button" onClick={onRefresh} disabled={loading}>{loading ? 'Actualizando…' : 'Actualizar estado'}</button>
      </header>

      <div className="apple-health-strip">
        <div><i className="is-green" /><span>API</span><strong>{summary?.system?.api || '—'}</strong></div>
        <div><i className="is-blue" /><span>Base de datos</span><strong>{summary?.database?.database || '—'}</strong></div>
        <div><i className="is-purple" /><span>Folio actual</span><strong>{current ? `${current.anio}-${current.serie}-${String(current.ultimo_valor).padStart(4, '0')}` : 'Sin emisiones'}</strong></div>
      </div>

      <div className="apple-metric-grid">
        <article><span>Usuarios activos</span><strong>{loading ? '…' : metrics.usersActive ?? 0}</strong><small>{metrics.adminsActive ?? 0} administradores</small></article>
        <article><span>Eventos</span><strong>{loading ? '…' : metrics.eventsTotal ?? 0}</strong><small>{metrics.eventsActive ?? 0} activos</small></article>
        <article><span>Plantillas</span><strong>{loading ? '…' : metrics.templatesActive ?? 0}</strong><small>activas</small></article>
        <article><span>Documentos</span><strong>{loading ? '…' : metrics.certificatesTotal ?? 0}</strong><small>{metrics.certificatesIssued ?? 0} emitidos</small></article>
      </div>

      <section className="apple-panel">
        <div className="apple-panel__title"><div><span>ACCESOS RÁPIDOS</span><h2>Herramientas frecuentes</h2></div></div>
        <div className="apple-quick-grid">
          {quick.map(([id, title, detail, icon]) => (
            <button type="button" key={id} onClick={() => onNavigate(id)}><b>{icon}</b><span><strong>{title}</strong><small>{detail}</small></span><em>›</em></button>
          ))}
        </div>
      </section>

      <div className="apple-two-column">
        <section className="apple-panel">
          <div className="apple-panel__title"><div><span>ÚLTIMA EMISIÓN</span><h2>Documento más reciente</h2></div></div>
          {latest ? <div className="apple-latest-card"><strong>{latest.folio}</strong><span>{latest.nombre_persona}</span><small>{latest.estado} · {formatDate(latest.fecha_emision)}</small></div> : <p className="apple-empty">Todavía no hay emisiones.</p>}
        </section>
        <section className="apple-panel">
          <div className="apple-panel__title"><div><span>ACTIVIDAD</span><h2>Auditoría reciente</h2></div><button type="button" onClick={() => onNavigate('audit')}>Ver todo</button></div>
          <div className="apple-feed">
            {(summary?.audit || []).slice(0, 5).map((item) => <div key={item.id_auditoria}><i /><span><strong>{item.accion}</strong><small>{item.entidad}{item.id_entidad ? ` #${item.id_entidad}` : ''}</small></span><time>{formatDate(item.fecha)}</time></div>)}
            {!(summary?.audit || []).length ? <p className="apple-empty">Sin actividad reciente.</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
