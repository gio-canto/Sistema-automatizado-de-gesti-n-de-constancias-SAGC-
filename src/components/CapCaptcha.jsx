import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

let capWidgetLoader;

function localCapAsset(fileName) {
  return `${import.meta.env.BASE_URL}vendor/cap/${fileName}`;
}

function loadCapWidget() {
  window.CAP_CUSTOM_WASM_URL = localCapAsset('cap_wasm_bg.wasm');
  window.CAP_PAKO_URL = localCapAsset('pako_inflate.min.js');
  window.CAP_DISABLE_WIDGET_REF = true;

  if (customElements.get('cap-widget')) {
    return Promise.resolve();
  }

  if (!capWidgetLoader) {
    capWidgetLoader = new Promise((resolve, reject) => {
      const selector = 'script[data-sagc-cap-widget="true"]';
      const existing = document.querySelector(selector);

      const finish = () => {
        if (customElements.get('cap-widget')) {
          resolve();
          return;
        }

        reject(
          new Error(
            'El recurso local de Cap cargó, pero no registró el elemento cap-widget.'
          )
        );
      };

      if (existing) {
        if (existing.dataset.loaded === 'true') {
          finish();
          return;
        }

        existing.addEventListener('load', finish, { once: true });
        existing.addEventListener(
          'error',
          () => reject(new Error('No fue posible cargar el widget local de Cap.')),
          { once: true }
        );
        return;
      }

      const script = document.createElement('script');
      script.src = localCapAsset('cap.min.js');
      script.async = true;
      script.dataset.sagcCapWidget = 'true';

      script.addEventListener(
        'load',
        () => {
          script.dataset.loaded = 'true';
          finish();
        },
        { once: true }
      );

      script.addEventListener(
        'error',
        () => reject(new Error('No fue posible cargar el widget local de Cap.')),
        { once: true }
      );

      document.head.appendChild(script);
    }).catch((error) => {
      capWidgetLoader = undefined;
      throw error;
    });
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
        if (active) {
          setReady(true);
          setError('');
        }
      })
      .catch(() => {
        if (active) {
          setReady(false);
          setError('No fue posible cargar la verificación CAP local.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return undefined;

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
