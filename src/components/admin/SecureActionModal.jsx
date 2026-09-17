import { useEffect, useState } from 'react';

export default function SecureActionModal({ open, onClose, onConfirm, busy = false, error = '' }) {
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!open) setPassword('');
  }, [open]);

  if (!open) return null;

  function close() {
    if (busy) return;
    setPassword('');
    onClose?.();
  }

  async function submit(event) {
    event.preventDefault();
    if (!password) return;
    const ok = await onConfirm(password);
    if (ok) setPassword('');
  }

  return (
    <div className="apple-secure-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) close();
    }}>
      <form className="apple-secure-modal" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="secure-title">
        <div className="apple-secure-modal__icon">⌾</div>
        <h2 id="secure-title">Confirmar acceso administrativo</h2>
        <p>Introduce tu contraseña para desbloquear temporalmente las acciones sensibles de SAGC.</p>
        <label>
          <span>Contraseña</span>
          <input
            autoFocus
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••••••"
            disabled={busy}
          />
        </label>
        {error ? <div className="apple-secure-modal__error">{error}</div> : null}
        <div className="apple-secure-modal__actions">
          <button type="button" className="secondary" onClick={close} disabled={busy}>Cancelar</button>
          <button type="submit" className="primary" disabled={!password || busy}>{busy ? 'Verificando…' : 'Desbloquear'}</button>
        </div>
        <small>El modo elevado expira automáticamente y la contraseña se limpia del formulario al cerrar este diálogo.</small>
      </form>
    </div>
  );
}
