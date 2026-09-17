import { UserBlobatar } from '../ui/ReferenceControls.jsx';

const groups = [
  { label: 'General', items: [['dashboard', 'Inicio', '⌂'], ['activity', 'Actividad', '◌'], ['console', 'Consola', '›_']] },
  { label: 'Gestión', items: [['users', 'Usuarios', '◎'], ['events', 'Eventos', '◫'], ['templates', 'Plantillas', '▤'], ['documents', 'Documentos', '▱']] },
  { label: 'Control', items: [['audit', 'Auditoría', '≣'], ['system', 'Sistema', '⌁'], ['security', 'Seguridad', '◇']] },
  { label: 'Preferencias', items: [['settings', 'Configuración', '⚙'], ['support', 'Soporte', '?']] },
];

export default function AdminShell({
  active,
  onNavigate,
  user,
  elevated,
  onUnlock,
  onLock,
  onBack,
  onLogout,
  appearance = 'light',
  density = 'comfortable',
  children,
}) {
  const classes = `apple-admin-shell apple-admin-shell--${appearance} apple-admin-shell--${density}`;

  return (
    <section className={classes}>
      <aside className="apple-admin-sidebar">
        <div className="apple-admin-sidebar__traffic" aria-hidden="true"><i className="red" /><i className="yellow" /><i className="green" /></div>
        <button className="apple-admin-sidebar__back" type="button" onClick={onBack}><span>‹</span> Volver a SAGC</button>
        <div className="apple-admin-sidebar__brand"><div className="apple-admin-sidebar__mark">S</div><div><strong>SAGC</strong><small>Admin Console</small></div></div>

        <nav className="apple-admin-sidebar__nav" aria-label="Navegación administrativa">
          {groups.map((group) => (
            <div className="apple-admin-sidebar__group" key={group.label}>
              <span>{group.label}</span>
              {group.items.map(([id, label, icon]) => (
                <button key={id} type="button" className={active === id ? 'is-active' : ''} onClick={() => onNavigate(id)}>
                  <b aria-hidden="true">{icon}</b><span>{label}</span>{id === 'security' && elevated ? <i className="apple-admin-sidebar__dot" /> : null}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="apple-admin-sidebar__secure-card">
          <div><span className={elevated ? 'is-unlocked' : ''} /><strong>{elevated ? 'Modo elevado' : 'Modo protegido'}</strong></div>
          <small>{elevated ? 'Acciones sensibles desbloqueadas temporalmente.' : 'Confirma tu contraseña para acciones sensibles.'}</small>
          <button type="button" onClick={elevated ? onLock : onUnlock}>{elevated ? 'Bloquear ahora' : 'Desbloquear'}</button>
        </div>

        <div className="apple-admin-sidebar__profile">
          {user?.foto ? <img src={user.foto} alt="" /> : <UserBlobatar name={user?.usuario || user?.nombre || 'admin'} size={38} />}
          <div><strong>{user?.nombre || user?.usuario || 'Administrador'}</strong><small>ADMIN</small></div>
          <button type="button" onClick={onLogout} title="Cerrar sesión">⏻</button>
        </div>
      </aside>

      <div className="apple-admin-main">
        <header className="apple-admin-topbar">
          <div><strong>Consola administrativa</strong><span>Centro de control SAGC</span></div>
          <div className="apple-admin-topbar__actions">
            <button type="button" onClick={() => onNavigate('console')} title="Consola limitada">›_</button>
            <button type="button" onClick={() => onNavigate('security')} className={elevated ? 'is-elevated' : ''} title="Seguridad">◇</button>
          </div>
        </header>
        <main className="apple-admin-content">{children}</main>
      </div>
    </section>
  );
}
