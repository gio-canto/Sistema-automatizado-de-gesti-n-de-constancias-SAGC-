import { OFFICIAL_LOGO } from '../../assets/branding.js';
import { UserBlobatar } from '../ui/ReferenceControls.jsx';

function ExitIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 5H5v14h5" />
      <path d="M13 8l4 4-4 4M9 12h8" />
    </svg>
  );
}

export default function InstitutionalHeader({ user, onLogout }) {
  const name = user?.nombre || user?.usuario || 'Usuario SAGC';
  const role = String(user?.permiso || 'NORMAL').toUpperCase();
  const visibleRole = role === 'DEMO' ? 'ADMIN · DEMO' : role;

  return (
    <header className="workspace-header">
      <div className="workspace-header__brand">
        <img
          src={OFFICIAL_LOGO}
          alt="Consejo de Ciencia, Tecnología e Innovación del Estado de Guerrero"
        />
      </div>

      <div className="workspace-header__account">
        {user?.foto ? (
          <img className="workspace-header__photo" src={user.foto} alt="" />
        ) : (
          <UserBlobatar
            className="workspace-header__avatar"
            name={user?.usuario || name}
            size={46}
          />
        )}

        <div className="workspace-header__identity">
          <strong>{name}</strong>
          <span>{visibleRole}</span>
        </div>

        <button
          className="workspace-header__logout"
          type="button"
          onClick={onLogout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <ExitIcon />
        </button>
      </div>
    </header>
  );
}
