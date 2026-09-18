export default function LocalCaptcha({ checked, loading, onChange }) {
  return (
    <button
      type="button"
      className={`recaptcha ${checked ? 'is-checked' : ''}`}
      onClick={onChange}
      disabled={loading}
      aria-pressed={checked}
    >
      <span className="recaptcha-control" aria-hidden="true">
        {loading ? (
          <span className="captcha-spinner" />
        ) : checked ? (
          <span className="captcha-check">✓</span>
        ) : null}
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
