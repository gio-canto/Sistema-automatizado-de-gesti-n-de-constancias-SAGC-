import { useState } from 'react';
import { OFFICIAL_LOGO } from '../assets/branding.js';
import { authenticateUser } from '../services/auth.js';
import { EyeIcon, LockIcon, MailIcon } from './AuthIcons.jsx';
import LocalCaptcha from './LocalCaptcha.jsx';

export default function LoginForm({ onAuthenticated }) {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function verifyCaptcha() {
    if (captchaChecked || captchaLoading) return;

    setCaptchaLoading(true);
    window.setTimeout(() => {
      setCaptchaLoading(false);
      setCaptchaChecked(true);
      setMessage('');
    }, 650);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    const normalizedUser = user.trim();

    if (!normalizedUser || !password) {
      setMessage('Ingrese su usuario y contraseña.');
      return;
    }

    if (!captchaChecked) {
      setMessage('Complete la verificación CAPTCHA para continuar.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await authenticateUser({
        user: normalizedUser,
        password,
      });

      if (!result.ok) {
        setPassword('');
        setCaptchaChecked(false);
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

              <button
                className="btn-cocytieg btn-cocytieg--primario btn-login"
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Verificando...' : 'Iniciar sesión'}
              </button>

              <div className="captcha-container">
                <LocalCaptcha
                  checked={captchaChecked}
                  loading={captchaLoading}
                  onChange={verifyCaptcha}
                />
              </div>

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
