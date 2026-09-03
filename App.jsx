import { useEffect, useState } from 'react';

const DEMO_USER = 'admin@cocytieg.gob.mx';
const DEMO_PASSWORD = 'SAGC2026';

const LOGIN_IMAGES = [
  'https://firebasestorage.googleapis.com/v0/b/fesgro-cocytieg.appspot.com/o/src%2FloginImage%2Fimagen1.jpg?alt=media',
  'https://firebasestorage.googleapis.com/v0/b/fesgro-cocytieg.appspot.com/o/src%2FloginImage%2Fimagen2.jpg?alt=media',
  'https://firebasestorage.googleapis.com/v0/b/fesgro-cocytieg.appspot.com/o/src%2FloginImage%2Fimagen3.jpg?alt=media',
  'https://firebasestorage.googleapis.com/v0/b/fesgro-cocytieg.appspot.com/o/src%2FloginImage%2Fimagen4.jpg?alt=media',
];

const OFFICIAL_LOGO = 'https://www.fesgro.cocytieg.gob.mx/images/logo_horizontal_w_256.png';

function EyeIcon({ visible }) {
  return visible ? (
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

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="1.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function LocalCaptcha({ checked, loading, onChange }) {
  return (
    <button
      type="button"
      className={`recaptcha ${checked ? 'is-checked' : ''}`}
      onClick={onChange}
      aria-pressed={checked}
      disabled={loading}
    >
      <span className="recaptcha-control" aria-hidden="true">
        {loading ? <span className="captcha-spinner" /> : checked ? <span className="captcha-check">✓</span> : null}
      </span>
      <span className="recaptcha-label">I'm not a robot</span>
      <span className="recaptcha-brand" aria-hidden="true">
        <span className="captcha-mark">↻</span>
        <strong>CAPTCHA</strong>
        <small>Privacy - Terms</small>
      </span>
    </button>
  );
}

function AccessGranted({ onLogout }) {
  return (
    <main className="access-page">
      <section className="access-card">
        <img src={OFFICIAL_LOGO} alt="Consejo de Ciencia, Tecnología e Innovación del Estado de Guerrero" />
        <span className="access-ok">✓</span>
        <h1>Acceso autorizado</h1>
        <p>Sistema automatizado de gestión de constancias (SAGC)</p>
        <button type="button" onClick={onLogout}>Cerrar sesión</button>
      </section>
    </main>
  );
}

export default function App() {
  const [imageIndex, setImageIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    LOGIN_IMAGES.forEach((src) => {
      const image = new Image();
      image.src = src;
    });

    const interval = window.setInterval(() => {
      setImageIndex((current) => (current + 1) % LOGIN_IMAGES.length);
    }, 6500);

    return () => window.clearInterval(interval);
  }, []);

  function verifyCaptcha() {
    if (captchaChecked || captchaLoading) return;
    setCaptchaLoading(true);
    window.setTimeout(() => {
      setCaptchaLoading(false);
      setCaptchaChecked(true);
      setMessage('');
    }, 700);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    if (!email.trim() || !password) {
      setMessage('Ingrese su correo electrónico y contraseña.');
      return;
    }

    if (!captchaChecked) {
      setMessage('Complete la verificación CAPTCHA para continuar.');
      return;
    }

    if (email.trim().toLowerCase() !== DEMO_USER || password !== DEMO_PASSWORD) {
      setMessage('Correo electrónico o contraseña incorrectos.');
      setPassword('');
      setCaptchaChecked(false);
      return;
    }

    setAuthenticated(true);
  }

  function logout() {
    setAuthenticated(false);
    setEmail('');
    setPassword('');
    setCaptchaChecked(false);
    setMessage('');
  }

  if (authenticated) {
    return <AccessGranted onLogout={logout} />;
  }

  return (
    <main className="auth-container">
      <section className="resheno" aria-label="Galería de Guerrero">
        {LOGIN_IMAGES.map((src, index) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`login-background ${index === imageIndex ? 'is-active' : ''}`}
            aria-hidden="true"
          />
        ))}
      </section>

      <section className="auth-form-side">
        <div className="auth-box">
          <img
            className="official-logo"
            src={OFFICIAL_LOGO}
            alt="Consejo de Ciencia, Tecnología e Innovación del Estado de Guerrero"
          />

          <div className="auth-title">
            <h1>Sistema automatizado de gestión de constancias<br />(SAGC)</h1>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="email">Correo electrónico</label>
            <div className="field-wrap">
              <span className="input-icon"><MailIcon /></span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="Correo electrónico"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <label htmlFor="password">Contraseña</label>
            <div className="field-wrap">
              <span className="input-icon"><LockIcon /></span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Contraseña"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className="eye-button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>

            <button className="login-button" type="submit">Iniciar sesión</button>

            <div className="captcha-area">
              <LocalCaptcha
                checked={captchaChecked}
                loading={captchaLoading}
                onChange={verifyCaptcha}
              />
            </div>

            {message && <div className="auth-message" role="alert">{message}</div>}
          </form>
        </div>
      </section>
    </main>
  );
}
