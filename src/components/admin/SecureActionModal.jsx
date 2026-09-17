import { useState } from 'react';

export default function SecureActionModal({ open, onClose, onConfirm, busy = false, error = '' }) {
  const [password, setPassword] = useState('');

  if (!open) return null;

  async function submit(event) {
    event.preventDefault();
    if (!password) return;
    const ok = await onConfirm(password);
    if (ok) setPassword('');
  }

  return (
    <div className="apple-secure-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onClose?.();
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
          <button type="button" className="secondary" onClick={onClose} disabled={busy}>Cancelar</button>
          <button type="submit" className="primary" disabled={!password || busy}>{busy ? 'Verificando…' : 'Desbloquear'}</button>
        </div>
        <small>El modo elevado expira automáticamente y nunca revela tu contraseña al navegador después de verificarla.</small>
      </form>
    </div>
  );
}
