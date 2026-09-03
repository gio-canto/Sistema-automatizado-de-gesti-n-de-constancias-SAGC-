import { useMemo, useState } from 'react';

const DEMO_USER = 'admin';
const DEMO_PASSWORD = 'SAGC2026';

function createCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.2 9.6a1 1 0 0 0 0 1.2C2.7 11.4 6.5 16 12 16s9.3-4.6 9.8-5.2a1 1 0 0 0 0-1.2C21.3 9 17.5 4 12 4S2.7 9 2.2 9.6Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3l18 18M10.7 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10 10 0 0 1 12 4c5.5 0 9.3 5 9.8 5.6a1 1 0 0 1 0 1.2 15 15 0 0 1-3 3.1M6.3 6.4a15.7 15.7 0 0 0-4.1 3.2 1 1 0 0 0 0 1.2C2.7 11.4 6.5 16 12 16c1 0 2-.2 2.9-.5" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 7v5h-5M4 17v-5h5M6.1 8.3A7 7 0 0 1 18.5 7M5.5 17A7 7 0 0 0 17.9 15.7" />
    </svg>
  );
}

function InstitutionalLogo({ src, alt, compact = false }) {
  return (
    <span className={`institution-logo ${compact ? 'is-compact' : ''}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
          event.currentTarget.nextElementSibling.style.display = 'grid';
        }}
      />
      <span className="logo-fallback" aria-hidden="true">GRO</span>
    </span>
  );
}

function AccessGranted({ onLogout }) {
  return (
    <main className="access-screen">
      <header className="access-header">
        <div className="access-brand">
          <InstitutionalLogo src="https://www.cocytieg.gob.mx/favicon.ico" alt="COCYTIEG" compact />
          <div>
            <strong>SAGC</strong>
            <span>Sistema Automatizado de Gestión de Constancias</span>
          </div>
        </div>
        <button type="button" className="logout-button" onClick={onLogout}>Cerrar sesión</button>
      </header>

      <section className="access-content">
        <div className="success-seal">✓</div>
        <p className="section-kicker">ACCESO AUTORIZADO</p>
        <h1>Bienvenido al SAGC</h1>
        <p>El inicio de sesión de demostración funciona correctamente.</p>
        <div className="empty-module">
          <span>Módulo administrativo</span>
          <strong>Próximamente</strong>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captcha, setCaptcha] = useState(() => createCaptcha());
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [authenticated, setAuthenticated] = useState(false);

  const captchaLetters = useMemo(() => captcha.split(''), [captcha]);

  function refreshCaptcha() {
    setCaptcha(createCaptcha());
    setCaptchaInput('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    if (!user.trim() || !password || !captchaInput.trim()) {
      setStatus('error');
      setMessage('Completa usuario, contraseña y código de verificación.');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captcha) {
      setStatus('error');
      setMessage('El código de verificación no coincide. Inténtalo nuevamente.');
      refreshCaptcha();
      return;
    }

    if (user.trim() !== DEMO_USER || password !== DEMO_PASSWORD) {
      setStatus('error');
      setMessage('Usuario o contraseña incorrectos.');
      setPassword('');
      refreshCaptcha();
      return;
    }

    setStatus('success');
    setAuthenticated(true);
  }

  function logout() {
    setAuthenticated(false);
    setUser('');
    setPassword('');
    setMessage('');
    setStatus('idle');
    refreshCaptcha();
  }

  if (authenticated) {
    return <AccessGranted onLogout={logout} />;
  }

  return (
    <main className="fesgro-page">
      <section className="visual-panel" aria-label="Identidad institucional">
        <div className="visual-overlay" />
        <div className="visual-content">
          <div className="government-lockup">
            <InstitutionalLogo src="https://www.guerrero.gob.mx/favicon.ico" alt="Gobierno del Estado de Guerrero" />
            <div className="government-copy">
              <span>Gobierno del Estado</span>
              <strong>GUERRERO</strong>
            </div>
          </div>

          <div className="hero-copy">
            <p className="hero-eyebrow">Consejo de Ciencia, Tecnología e Innovación</p>
            <h1>FESGRO</h1>
            <div className="hero-rule" />
            <p>Foro de Estudios sobre Guerrero</p>
            <span>Plataforma institucional</span>
          </div>

          <div className="visual-footer">Ciencia · Tecnología · Innovación</div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-wrap">
          <header className="login-header">
            <div className="cocytieg-lockup">
              <InstitutionalLogo src="https://www.cocytieg.gob.mx/favicon.ico" alt="COCYTIEG" />
              <div>
                <strong>COCYTIEG</strong>
                <span>Consejo de Ciencia, Tecnología e Innovación del Estado de Guerrero</span>
              </div>
            </div>
            <p className="platform-name">SAGC</p>
          </header>

          <div className="login-card">
            <div className="form-heading">
              <p>ACCESO AL SISTEMA</p>
              <h2>Iniciar sesión</h2>
              <span>Ingresa tus credenciales para continuar.</span>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="username">Usuario</label>
              <div className="input-shell">
                <span className="field-icon" aria-hidden="true">@</span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Ingresa tu usuario"
                  value={user}
                  onChange={(event) => setUser(event.target.value)}
                />
              </div>

              <label htmlFor="password">Contraseña</label>
              <div className="input-shell">
                <span className="field-icon lock-icon" aria-hidden="true">●</span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              <div className="captcha-heading">
                <label htmlFor="captcha">Código de verificación</label>
                <span>Escribe los caracteres de la imagen</span>
              </div>

              <div className="captcha-row">
                <div className="captcha-box" aria-label={`Código captcha: ${captcha}`}>
                  <div className="captcha-noise" aria-hidden="true" />
                  {captchaLetters.map((letter, index) => (
                    <span key={`${letter}-${index}`} style={{ '--captcha-index': index }}>{letter}</span>
                  ))}
                </div>
                <button type="button" className="captcha-refresh" onClick={refreshCaptcha} aria-label="Generar nuevo código">
                  <RefreshIcon />
                </button>
              </div>

              <input
                id="captcha"
                className="captcha-input"
                type="text"
                inputMode="text"
                autoComplete="off"
                maxLength={5}
                placeholder="Código de 5 caracteres"
                value={captchaInput}
                onChange={(event) => setCaptchaInput(event.target.value.toUpperCase())}
              />

              {message && (
                <div className={`form-message ${status === 'error' ? 'is-error' : ''}`} role="alert">
                  {message}
                </div>
              )}

              <button className="primary-button" type="submit">Iniciar sesión</button>
            </form>

            <div className="help-line">
              <span>Acceso exclusivo para personal autorizado</span>
            </div>
          </div>

          <footer className="page-footer">
            <span>© 2026 COCYTIEG</span>
            <span>Sistema Automatizado de Gestión de Constancias</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
