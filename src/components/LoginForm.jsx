import { useRef, useState } from 'react';
import { OFFICIAL_LOGO } from '../assets/branding.js';
import { authenticateUser } from '../services/auth.js';
import { EyeIcon, LockIcon, MailIcon } from './AuthIcons.jsx';
import CapCaptcha from './CapCaptcha.jsx';

export default function LoginForm({ onAuthenticated }) {
  const captchaRef = useRef(null);
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capToken, setCapToken] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    const normalizedUser = user.trim();

    if (!normalizedUser || !password) {
      setMessage('Ingrese su usuario y contraseña.');
      return;
    }

    if (!capToken) {
      setMessage('Complete la verificación CAP para continuar.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await authenticateUser({
        user: normalizedUser,
        password,
        capToken,
      });

      if (!result.ok) {
        setPassword('');
        setCapToken('');
        captchaRef.current?.reset();
        setMessage(result.error);
        return;
      }

      onAuthenticated(result.user);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="front-form">
      <div className="resheno" aria-hidden="true" />

      <section className="form-container" aria-label="Inicio de sesión SAGC">
        <div className="sub-form-container">
          <div className="logo-inicio">
            <img
              className="official-logo"
              src={OFFICIAL_LOGO}
              alt="Consejo de Ciencia, Tecnología e Innovación del Estado de Guerrero"
            />
          </div>

          <div className="children-form">
            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <div className="login-title">
                <h1>
                  Sistema automatizado de gestión de constancias
                  <br />
                  (SAGC)
                </h1>
              </div>

              <div className="input-overcontainer">
                <label className="label-container" htmlFor="user">
                  Usuario
                </label>
                <div className="input-container">
                  <div className="ant-input-affix-wrapper">
                    <span className="ant-input-prefix" aria-hidden="true">
                      <MailIcon />
                    </span>
                    <input
                      id="user"
                      className="ant-input"
                      type="text"
                      autoComplete="username"
                      placeholder="Usuario"
                      value={user}
                      onChange={(event) => setUser(event.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="input-overcontainer">
                <label className="label-container" htmlFor="password">
                  Contraseña
                </label>
                <div className="input-container">
                  <div className="ant-input-affix-wrapper">
                    <span className="ant-input-prefix" aria-hidden="true">
                      <LockIcon />
                    </span>
                    <input
                      id="password"
                      className="ant-input"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Contraseña"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                    <button
                      className="ant-input-suffix password-eye"
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label="Mostrar u ocultar contraseña"
                    >
                      <EyeIcon />
                    </button>
                  </div>
                </div>
              </div>

              <div className="captcha-container">
                <CapCaptcha
                  ref={captchaRef}
                  onToken={setCapToken}
                  disabled={submitting}
                />
              </div>

              <button
                className="btn-cocytieg btn-cocytieg--primario btn-login"
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Verificando...' : 'Iniciar sesión'}
              </button>

              {message && (
                <div className="auth-message" role="alert">
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
