import { useMemo, useRef, useState } from 'react';
import { Blobatar } from '@blobatar/react';

function Icon({ name, size = 20 }) {
  const paths = {
    trash: <><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="m7 7 1 13h8l1-13"/></>,
    eye: <><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5S2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
    upload: <><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
    attach: <path d="m8 12 6.5-6.5a3.5 3.5 0 0 1 5 5L10 20a5 5 0 0 1-7-7l9-9"/>,
    link: <><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></>,
    smile: <><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></>,
    check: <path d="m5 12 4 4 10-10"/>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export function ActionButton({ children = 'Eliminar', tone = 'danger', loading = false, onClick, type = 'button' }) {
  return (
    <button className={`sagc-action-btn sagc-action-btn--${tone}`} type={type} onClick={onClick} disabled={loading}>
      <span className="sagc-action-btn__icon">{loading ? <span className="sagc-mini-spinner" /> : <Icon name="trash" />}</span>
      <span>{loading ? 'Procesando…' : children}</span>
    </button>
  );
}

function passwordScore(value) {
  const rules = [
    value.length >= 12,
    /[A-Z]/.test(value),
    /[a-z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ];
  return { rules, score: rules.filter(Boolean).length };
}

export function PasswordStrengthField({ value, onChange, label = 'Contraseña', placeholder = 'Escribe tu contraseña' }) {
  const [visible, setVisible] = useState(false);
  const { rules, score } = useMemo(() => passwordScore(value ?? ''), [value]);
  const strength = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte', 'Muy fuerte'][score];

  return (
    <div className="sagc-password-field">
      <label className="sagc-floating-label">
        <span>{label}</span>
        <input type={visible ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder} autoComplete="new-password" />
        <button type="button" className="sagc-icon-button" onClick={() => setVisible((current) => !current)} aria-label="Mostrar u ocultar contraseña">
          <Icon name="eye" />
        </button>
      </label>
      <div className="sagc-password-meta">
        <span>Seguridad</span>
        <strong>{strength}</strong>
      </div>
      <div className="sagc-strength-track" aria-hidden="true"><span style={{ width: `${(score / 5) * 100}%` }} /></div>
      <div className="sagc-rule-row">
        {['12 caracteres', 'A-Z', 'a-z', '123', '@#$'].map((text, index) => (
          <span key={text} className={rules[index] ? 'is-valid' : ''}><i>{rules[index] ? '✓' : '○'}</i>{text}</span>
        ))}
      </div>
    </div>
  );
}

export function FileDropzone({ accept = '.pdf,.doc,.docx,.png,.jpg,.jpeg', maxSizeMB = 10, onFiles }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handle(files) {
    const list = Array.from(files ?? []);
    if (list.length) onFiles?.(list);
  }

  return (
    <div
      className={`sagc-dropzone ${dragging ? 'is-dragging' : ''}`}
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); handle(event.dataTransfer.files); }}
    >
      <input ref={inputRef} type="file" hidden multiple accept={accept} onChange={(event) => handle(event.target.files)} />
      <div className="sagc-dropzone__orb"><Icon name="upload" size={28} /></div>
      <h3>Suelta tus archivos aquí</h3>
      <p>o <button type="button" onClick={() => inputRef.current?.click()}>selecciona archivos</button></p>
      <div className="sagc-dropzone__meta"><span>{accept.replaceAll('.', '').toUpperCase()}</span><span>Máx. {maxSizeMB} MB</span></div>
    </div>
  );
}

export function DateField({ value, onChange, label = 'Selecciona una fecha' }) {
  return (
    <label className="sagc-date-field">
      <Icon name="calendar" />
      <span>{label}</span>
      <input type="date" value={value} onChange={onChange} />
    </label>
  );
}

export function ComposerField({ value, onChange, maxLength = 150, placeholder = 'Escribe aquí…', onAttach, onLink }) {
  const length = value?.length ?? 0;
  return (
    <div className="sagc-composer">
      <textarea value={value} onChange={onChange} maxLength={maxLength} placeholder={placeholder} />
      <div className="sagc-composer__toolbar">
        <button type="button" aria-label="Emoji"><Icon name="smile" /></button>
        <button type="button" aria-label="Adjuntar" onClick={onAttach}><Icon name="attach" /></button>
        <button type="button" aria-label="Agregar enlace" onClick={onLink}><Icon name="link" /></button>
        <span>{length}/{maxLength}</span>
      </div>
    </div>
  );
}

export function SuccessCard({ title = 'Operación completada', description = 'La acción se realizó correctamente.', actionLabel = 'Continuar', onAction }) {
  return (
    <section className="sagc-success-card">
      <span className="sagc-success-card__badge"><Icon name="check" size={28} /></span>
      <h3>{title}</h3>
      <p>{description}</p>
      {onAction && <button type="button" onClick={onAction}>{actionLabel}</button>}
    </section>
  );
}

export function ProgressIconButton({ progress = 0, label = 'Progreso', onClick }) {
  const safe = Math.max(0, Math.min(100, progress));
  return (
    <button type="button" className="sagc-progress-button" onClick={onClick} aria-label={`${label}: ${safe}%`} style={{ '--progress': `${safe * 3.6}deg` }}>
      <span className="sagc-progress-button__ring" />
      <span className="sagc-progress-button__mark">{safe >= 100 ? '✓' : '—'}</span>
    </button>
  );
}

export function UserBlobatar({ name, size = 40, className = '' }) {
  return <Blobatar name={name || 'SAGC'} size={size} className={className} />;
}