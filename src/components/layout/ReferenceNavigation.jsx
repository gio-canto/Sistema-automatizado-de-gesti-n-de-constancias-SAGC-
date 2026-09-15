import { UserBlobatar } from '../ui/ReferenceControls.jsx';

function NavIcon({ type }) {
  const paths = {
    home: <path d="M3 11.5 12 4l9 7.5V20H6v-8.5Z" />,
    users: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M4 19c0-3 2-5 5-5s5 2 5 5M14 15c2.5 0 4 1.4 4 4"/></>,
    folder: <path d="M3 6h7l2 2h9v10H3Z"/>,
    chart: <><path d="M5 20V10M12 20V4M19 20v-7"/></>,
    message: <path d="M4 5h16v11H9l-5 4Z"/>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.5 1a7 7 0 0 0-1.8-1L14.2 3h-4.4l-.4 3a7 7 0 0 0-1.8 1L5.1 6 3 9.4 5.1 11a7 7 0 0 0 0 2L3 14.6 5.1 18l2.5-1a7 7 0 0 0 1.8 1l.4 3h4.4l.4-3a7 7 0 0 0 1.8-1l2.5 1 2.1-3.4-2.1-1.6c.1-.3.1-.7.1-1Z"/></>,
    logout: <><path d="M10 5H5v14h5"/><path d="M13 8l4 4-4 4M9 12h8"/></>,
    search: <><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[type]}</svg>;
}

export function LightSidebar({
  brand = 'SAGC',
  user = { name: 'Usuario SAGC', email: 'usuario@ejemplo.mx' },
  active = 'dashboard',
  items,
  onNavigate,
  onLogout,
}) {
  const navigation = items ?? [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'usuarios', label: 'Usuarios', icon: 'users' },
    { id: 'eventos', label: 'Eventos', icon: 'folder' },
    { id: 'estadisticas', label: 'Estadísticas', icon: 'chart' },
    { id: 'mensajes', label: 'Mensajes', icon: 'message', badge: 3 },
  ];

  return (
    <aside className="sagc-sidebar">
      <div className="sagc-sidebar__brand"><span className="sagc-sidebar__brand-mark">S</span><strong>{brand}</strong></div>
      <label className="sagc-sidebar__search"><NavIcon type="search"/><input type="search" placeholder="Buscar navegación…" /></label>
      <nav className="sagc-sidebar__nav" aria-label="Navegación principal">
        {navigation.map((item) => (
          <button key={item.id} type="button" className={item.id === active ? 'is-active' : ''} onClick={() => onNavigate?.(item.id)}>
            <NavIcon type={item.icon}/><span>{item.label}</span>{item.badge ? <b>{item.badge}</b> : null}
          </button>
        ))}
      </nav>
      <div className="sagc-sidebar__secondary">
        <button type="button" onClick={() => onNavigate?.('settings')}><NavIcon type="settings"/><span>Configuración</span></button>
        <button type="button" onClick={onLogout}><NavIcon type="logout"/><span>Cerrar sesión</span></button>
      </div>
      <div className="sagc-sidebar__profile">
        <UserBlobatar name={user.email || user.name} size={42}/>
        <span><strong>{user.name}</strong><small>{user.email}</small></span>
        <button type="button" aria-label="Más opciones">⋮</button>
      </div>
    </aside>
  );
}

export function PillNav({ items, active, onChange }) {
  return (
    <nav className="sagc-pill-nav" aria-label="Navegación rápida">
      {items.map((item) => (
        <button key={item.id} type="button" className={item.id === active ? 'is-active' : ''} onClick={() => onChange?.(item.id)} aria-label={item.label}>
          <span>{item.icon}</span>{item.badge ? <b>{item.badge}</b> : null}
        </button>
      ))}
    </nav>
  );
}

export function StickyHeader({ brand = 'SAGC', items = [], active, onNavigate, action }) {
  return (
    <header className="sagc-sticky-header">
      <strong>{brand}</strong>
      <nav>
        {items.map((item) => <button key={item.id} type="button" className={item.id === active ? 'is-active' : ''} onClick={() => onNavigate?.(item.id)}>{item.label}</button>)}
      </nav>
      {action ? <button type="button" className="sagc-sticky-header__action" onClick={action.onClick}>{action.label}</button> : null}
    </header>
  );
}
