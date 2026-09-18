import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import wasmUrl from '@cap.js/wasm/browser/cap_wasm_bg.wasm?url';
import pakoUrl from 'pako/dist/pako_inflate.min.js?url';

let capWidgetLoader;

function loadCapWidget() {
  if (!capWidgetLoader) {
    window.CAP_CUSTOM_WASM_URL = wasmUrl;
    window.CAP_PAKO_URL = pakoUrl;
    window.CAP_DISABLE_WIDGET_REF = true;

    capWidgetLoader = import('cap-widget');
  }

  return capWidgetLoader;
}

const CapCaptcha = forwardRef(function CapCaptcha(
  { onToken, disabled = false },
  forwardedRef
) {
  const widgetRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useImperativeHandle(
    forwardedRef,
    () => ({
      reset() {
        widgetRef.current?.reset?.();
        setProgress(0);
        setError('');
        onToken?.('');
      },
    }),
    [onToken]
  );

  useEffect(() => {
    let active = true;

    loadCapWidget()
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        if (active) {
          setError('No fue posible cargar la verificación CAP.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget) return undefined;

    function handleSolve(event) {
      setProgress(100);
      setError('');
      onToken?.(event.detail?.token || '');
    }

    function handleProgress(event) {
      setProgress(Number(event.detail?.progress || 0));
    }

    function handleError(event) {
      onToken?.('');
      setProgress(0);
      setError(
        event.detail?.message ||
          'No se pudo completar la verificación. Intenta nuevamente.'
      );
    }

    function handleReset() {
      onToken?.('');
      setProgress(0);
      setError('');
    }

    widget.addEventListener('solve', handleSolve);
    widget.addEventListener('progress', handleProgress);
    widget.addEventListener('error', handleError);
    widget.addEventListener('reset', handleReset);

    return () => {
      widget.removeEventListener('solve', handleSolve);
      widget.removeEventListener('progress', handleProgress);
      widget.removeEventListener('error', handleError);
      widget.removeEventListener('reset', handleReset);
    };
  }, [ready, onToken]);

  const troubleshootingUrl = `${import.meta.env.BASE_URL}cap-troubleshooting.html`;

  return (
    <div
      className={`cap-captcha-shell ${disabled ? 'is-disabled' : ''}`}
      aria-busy={!ready}
    >
      <cap-widget
        ref={widgetRef}
        required
        data-cap-api-endpoint="/api/cap/login/"
        data-cap-troubleshooting-url={troubleshootingUrl}
        data-cap-disable-haptics
        data-cap-lang="es"
        data-cap-i18n-initial-state="Verifica que eres humano"
        data-cap-i18n-verifying-label="Verificando..."
        data-cap-i18n-solved-label="Verificado"
        data-cap-i18n-error-label="Error. Intenta de nuevo"
        data-cap-i18n-troubleshooting-label="Ayuda"
        data-cap-i18n-wasm-disabled="Activa WebAssembly para verificar más rápido"
        data-cap-i18n-verify-aria-label="Pulsa para verificar que eres humano"
        data-cap-i18n-verifying-aria-label="Verificando, espera un momento"
        data-cap-i18n-verified-aria-label="Verificación humana completada"
        data-cap-i18n-required-label="Completa la verificación humana"
        data-cap-i18n-error-aria-label="Ocurrió un error. Intenta nuevamente"
      />

      {!ready ? (
        <span className="cap-captcha-status">Preparando verificación segura…</span>
      ) : progress > 0 && progress < 100 ? (
        <span className="cap-captcha-status">
          Verificación {Math.round(progress)}%
        </span>
      ) : null}

      {error ? (
        <span className="cap-captcha-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
});

export default CapCaptcha;
