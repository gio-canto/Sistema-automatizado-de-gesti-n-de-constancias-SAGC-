import { useState } from 'react';

function EyeIcon({ hidden }) {
  return hidden ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.5 10.5 0 0 1 12 4c5.5 0 9.4 5.1 9.8 5.6a1 1 0 0 1 0 1.2 15.5 15.5 0 0 1-3 3.1M6.3 6.4A15.6 15.6 0 0 0 2.2 9.6a1 1 0 0 0 0 1.2C2.6 11.3 6.5 16 12 16c1 0 2-.2 2.9-.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.2 9.6a1 1 0 0 0 0 1.2C2.6 11.3 6.5 16 12 16s9.4-4.7 9.8-5.2a1 1 0 0 0 0-1.2C21.4 9.1 17.5 4 12 4S2.6 9.1 2.2 9.6Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function App() {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    if (!user.trim() || !password) {
      setStatus('error');
      setMessage('Ingresa tu usuario y contraseña.');
      return;
    }

    setStatus('loading');

    // Sustituir por la llamada real, por ejemplo:
    // const response = await fetch('/api/auth/login', { ... })
    await new Promise((resolve) => setTimeout(resolve, 650));

    setStatus('error');
    setMessage('El acceso todavía no está conectado al servidor SAGC.');
  }

  return (
    <main className="login-shell">
      <section className="brand-panel" aria-label="Identidad institucional">
        <div className="brand-wrap">
          <div className="brand-mark" aria-hidden="true">
            <span className="brand-mark__arc" />
            <span className="brand-mark__dot" />
          </div>
          <p className="brand-kicker">Consejo de Ciencia, Tecnología e Innovación</p>
          <h1>SAGC</h1>
          <p className="brand-name">Sistema Automatizado de Gestión de Constancias</p>
        </div>
        <p className="brand-foot">Acceso exclusivo para personal autorizado.</p>
      </section>

      <section className="form-panel">
        <div className="login-card">
          <header className="card-header">
            <p className="eyebrow">COCYTIEG</p>
            <h2>Iniciar sesión</h2>
            <p>Ingresa tus credenciales para acceder al sistema.</p>
          </header>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="user">Usuario</label>
            <input
              id="user"
              name="user"
              type="text"
              autoComplete="username"
              placeholder="Usuario"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              aria-invalid={status === 'error' && !user.trim()}
            />

            <label htmlFor="password">Contraseña</label>
            <div className="password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={status === 'error' && !password}
              />
              <button
                className="icon-button"
                type="button"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShowPassword((value) => !value)}
              >
                <EyeIcon hidden={showPassword} />
              </button>
            </div>

            <div className="form-meta">
              <span>Las cuentas son creadas por un administrador.</span>
              <button className="text-button" type="button">
                ¿Problemas para acceder?
              </button>
            </div>

            {message && (
              <div className={`status-message ${status === 'error' ? 'is-error' : ''}`} role="alert">
                {message}
              </div>
            )}

            <button className="submit-button" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Comprobando…' : 'Iniciar sesión'}
            </button>
          </form>

          <footer className="card-footer">
            <span>Uso institucional</span>
            <span aria-hidden="true">·</span>
            <span>SAGC</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
