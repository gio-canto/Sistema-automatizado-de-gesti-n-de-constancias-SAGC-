function WorkspaceIcon({ type }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  if (type === 'admin') {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true" {...common}>
        <circle cx="26" cy="20" r="10" />
        <path d="M9 49c1.5-11 7.5-17 17-17 5 0 9 1.7 12 5" />
        <circle cx="45" cy="43" r="9" />
        <path d="M45 29v5M45 52v5M31 43h5M54 43h5M35.2 33.2l3.5 3.5M51.3 49.3l3.5 3.5M54.8 33.2l-3.5 3.5M38.7 49.3l-3.5 3.5" />
      </svg>
    );
  }

  if (type === 'console') {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true" {...common}>
        <rect x="9" y="12" width="46" height="40" rx="6" />
        <path d="M9 22h46M19 31l7 6-7 6M31 43h12" />
        <circle cx="17" cy="17" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="23" cy="17" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="29" cy="17" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (type === 'user') {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true" {...common}>
        <circle cx="32" cy="21" r="11" />
        <path d="M13 53c2-13 9-20 19-20s17 7 19 20" />
        <path d="M47 10v12M41 16h12" />
      </svg>
    );
  }

  if (type === 'diploma' || type === 'recognition') {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true" {...common}>
        <rect x="10" y="10" width="44" height="35" rx="3" />
        <path d="M18 20h28M18 27h20" />
        <circle cx="41" cy="40" r="8" />
        <path d="m37 47-3 9 7-4 7 4-3-9" />
      </svg>
    );
  }

  if (type === 'accreditation') {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true" {...common}>
        <path d="M18 8h23l9 9v38H18z" />
        <path d="M41 8v10h10M25 28h18M25 35h14" />
        <circle cx="45" cy="45" r="8" />
        <path d="m41 52-3 8 7-4 7 4-3-8" />
      </svg>
    );
  }

  if (type === 'other') {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true" {...common}>
        <circle cx="18" cy="32" r="3" fill="currentColor" stroke="none" />
        <circle cx="32" cy="32" r="3" fill="currentColor" stroke="none" />
        <circle cx="46" cy="32" r="3" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...common}>
      <path d="M17 8h24l9 9v39H17z" />
      <path d="M41 8v10h10M24 29h19M24 36h19M24 43h13" />
    </svg>
  );
}

export default function WorkspaceCard({
  title,
  description,
  actionLabel,
  icon = 'document',
  onClick,
  wide = false,
  tone = 'blue',
}) {
  return (
    <article className={`workspace-card ${wide ? 'workspace-card--wide' : ''}`}>
      <div className={`workspace-card__icon workspace-card__icon--${tone}`}>
        <WorkspaceIcon type={icon} />
      </div>
      <div className="workspace-card__body">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      <button
        className="workspace-card__action"
        type="button"
        onClick={onClick}
      >
        {actionLabel}
      </button>
    </article>
  );
}
