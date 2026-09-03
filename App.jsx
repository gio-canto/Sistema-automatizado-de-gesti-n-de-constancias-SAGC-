import { useEffect, useState } from 'react';

const DEMO_USER = 'demo';
const DEMO_PASSWORD = 'demo';

const LOGIN_IMAGES = [
  'https://firebasestorage.googleapis.com/v0/b/fesgro-cocytieg.appspot.com/o/src%2FloginImage%2Fimagen1.jpg?alt=media',
  'https://firebasestorage.googleapis.com/v0/b/fesgro-cocytieg.appspot.com/o/src%2FloginImage%2Fimagen2.jpg?alt=media',
  'https://firebasestorage.googleapis.com/v0/b/fesgro-cocytieg.appspot.com/o/src%2FloginImage%2Fimagen3.jpg?alt=media',
  'https://firebasestorage.googleapis.com/v0/b/fesgro-cocytieg.appspot.com/o/src%2FloginImage%2Fimagen4.jpg?alt=media',
];

function MailIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m4 7 8 6 8-6"/></svg>;
}

function LockIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="1.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>;
}

function EyeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.2 9.6a1 1 0 0 0 0 1.2C2.7 11.4 6.5 16 12 16s9.3-4.6 9.8-5.2a1 1 0 0 0 0-1.2C21.3 9 17.5 4 12 4S2.7 9 2.2 9.6Z"/><circle cx="12" cy="10" r="3"/></svg>;
}

function LocalCaptcha({ checked, loading, onChange }) {
  return (
    <button type="button" className={`recaptcha ${checked ? 'is-checked' : ''}`} onClick={onChange} disabled={loading} aria-pressed={checked}>
      <span className="recaptcha-control" aria-hidden="true">{loading ? <span className="captcha-spinner"/> : checked ? <span className="captcha-check">✓</span> : null}</span>
      <span className="recaptcha-label">I'm not a robot</span>
      <span className="recaptcha-brand" aria-hidden="true"><span className="captcha-mark">↻</span><strong>CAPTCHA</strong><small>Demo local</small></span>
    </button>
  );
}

function AccessGranted({ onLogout }) {
  return (
    <main className="access-page">
      <section className="access-card">
        <div className="demo-badge">SAGC · DEMO</div>
        <span className="access-ok">✓</span>
        <h1>Acceso autorizado</h1>
        <p>Sistema automatizado de gestión de constancias</p>
        <button className="btn-cocytieg btn-cocytieg--primario" type="button" onClick={onLogout}>Cerrar sesión</button>
      </section>
    </main>
  );
}

export default function App() {
  const [imageIndex, setImageIndex] = useState(0);
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    LOGIN_IMAGES.forEach((src) => { const img = new Image(); img.src = src; });
    const interval = window.setInterval(() => setImageIndex((current) => (current + 1) % LOGIN_IMAGES.length), 6500);
    return () => window.clearInterval(interval);
  }, []);

  function verifyCaptcha() {
    if (captchaChecked || captchaLoading) return;
    setCaptchaLoading(true);
    window.setTimeout(() => { setCaptchaLoading(false); setCaptchaChecked(true); setMessage(''); }, 650);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    if (!user.trim() || !password) return setMessage('Ingrese el usuario y la contraseña de demostración.');
    if (!captchaChecked) return setMessage('Complete la verificación CAPTCHA para continuar.');
    if (user !== DEMO_USER || password !== DEMO_PASSWORD) {
      setPassword('');
      setCaptchaChecked(false);
      return setMessage('Credenciales de demostración incorrectas.');
    }
    setAuthenticated(true);
  }

  function logout() {
    setAuthenticated(false); setUser(''); setPassword(''); setShowPassword(false); setCaptchaChecked(false); setMessage('');
  }

  if (authenticated) return <AccessGranted onLogout={logout}/>;

  return (
    <main className="auth-container">
      <div className="back-image" aria-hidden="true">
        <div className="container-image">
          {LOGIN_IMAGES.map((src, index) => <img key={src} src={src} alt="" className={`imagen-mamalona ${index === imageIndex ? 'imagen-mamalona--active' : ''}`}/>) }
        </div>
      </div>

      <div className="front-form">
        <div className="resheno" aria-hidden="true"/>
        <section className="form-container" aria-label="Inicio de sesión SAGC de demostración">
          <div className="sub-form-container">
            <div className="logo-inicio">
              <div className="sagc-mark">SAGC</div>
              <div className="sagc-org">Sistema automatizado de gestión de constancias</div>
            </div>

            <div className="demo-notice">DEMOSTRACIÓN · No ingrese credenciales reales</div>

            <div className="children-form">
              <form className="login-form" onSubmit={handleSubmit} noValidate>
                <div className="login-title"><h1>Sistema automatizado de gestión de constancias<br/>(SAGC)</h1></div>

                <div className="input-overcontainer">
                  <label className="label-container" htmlFor="user">Usuario</label>
                  <div className="input-container"><div className="ant-input-affix-wrapper">
                    <span className="ant-input-prefix" aria-hidden="true"><MailIcon/></span>
                    <input id="user" className="ant-input" type="text" autoComplete="off" placeholder="Usuario de demostración" value={user} onChange={(event) => setUser(event.target.value)}/>
                  </div></div>
                </div>

                <div className="input-overcontainer">
                  <label className="label-container" htmlFor="password">Contraseña</label>
                  <div className="input-container"><div className="ant-input-affix-wrapper">
                    <span className="ant-input-prefix" aria-hidden="true"><LockIcon/></span>
                    <input id="password" className="ant-input" type={showPassword ? 'text' : 'password'} autoComplete="off" placeholder="Contraseña de demostración" value={password} onChange={(event) => setPassword(event.target.value)}/>
                    <button className="ant-input-suffix password-eye" type="button" onClick={() => setShowPassword((current) => !current)} aria-label="Mostrar u ocultar contraseña"><EyeIcon/></button>
                  </div></div>
                </div>

                <button className="btn-cocytieg btn-cocytieg--primario btn-login" type="submit">Iniciar sesión</button>
                <div className="captcha-container"><LocalCaptcha checked={captchaChecked} loading={captchaLoading} onChange={verifyCaptcha}/></div>
                {message && <div className="auth-message" role="alert">{message}</div>}
                <div className="demo-credentials">Demo: usuario <strong>demo</strong> · contraseña <strong>demo</strong></div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
