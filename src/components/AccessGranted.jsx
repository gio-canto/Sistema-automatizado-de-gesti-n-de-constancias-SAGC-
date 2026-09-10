import { OFFICIAL_LOGO } from '../assets/branding.js';

export default function AccessGranted({ onLogout }) {
  return (
    <main className="access-page">
      <section className="access-card">
        <img
          className="access-logo"
          src={OFFICIAL_LOGO}
          alt="Consejo de Ciencia, Tecnología e Innovación del Estado de Guerrero"
        />
        <span className="access-ok">✓</span>
        <h1>Acceso autorizado</h1>
        <p>Sistema automatizado de gestión de constancias (SAGC)</p>
        <button
          className="btn-cocytieg btn-cocytieg--primario"
          type="button"
          onClick={onLogout}
        >
          Cerrar sesión
        </button>
      </section>
    </main>
  );
}
