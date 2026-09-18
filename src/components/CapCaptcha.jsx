import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

let capWidgetLoader;
let capFetchDiagnosticsInstalled = false;

function localCapAsset(fileName) {
  return `${import.meta.env.BASE_URL}vendor/cap/${fileName}`;
}

function capStatusMessage(reason) {
  switch (reason) {
    case 'CAP_SECRET_MISSING':
      return 'CAP no está configurado: falta CAP_SECRET en server/.env.';
    case 'CAP_STORAGE_MISSING':
      return 'CAP necesita la migración database/migrations/002_cap_captcha.sql en Supabase.';
    case 'CAP_DATABASE_UNAVAILABLE':
      return 'CAP no puede acceder a Supabase/PostgreSQL.';
    case 'CAP_STATUS_ERROR':
      return 'La API no pudo comprobar el estado de CAP.';
    default:
      return 'La verificación CAP no está lista en el backend.';
  }
}

async function assertCapReady() {
  let response;

  try {
    response = await fetch('/api/cap/status', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
  } catch {
    throw new Error(
      'No fue posible contactar la API de SAGC. Comprueba que npm run server:dev esté ejecutándose.'
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.cap?.ready) {
    throw new Error(capStatusMessage(data?.cap?.reason));
  }
}

function installCapFetchDiagnostics() {
  if (capFetchDiagnosticsInstalled) return;

  const nativeFetch = window.fetch.bind(window);

  window.CAP_CUSTOM_FETCH = async (url, options = {}) => {
    let response;

    try {
      response = await nativeFetch(url, options);
    } catch (error) {
      window.__SAGC_CAP_LAST_ERROR =
        'La API de CAP no respondió. Comprueba que el backend SAGC siga activo.';
      throw error;
    }

    if (String(url).includes('/api/cap/')) {
      try {
        const payload = await response.clone().json();
        const backendError =
          payload?.error ||
          payload?.reason ||
          (payload?.success === false ? 'El backend rechazó el desafío CAP.' : '');

        if (!response.ok || payload?.success === false) {
          window.__SAGC_CAP_LAST_ERROR =
            backendError || `CAP respondió con HTTP ${response.status}.`;
        } else {
          window.__SAGC_CAP_LAST_ERROR = '';
        }
      } catch {
        if (!response.ok) {
          window.__SAGC_CAP_LAST_ERROR =
            `CAP respondió con HTTP ${response.status} sin una respuesta JSON válida.`;
        }
      }
    }

    return response;
  };

  capFetchDiagnosticsInstalled = true;
}

function loadCapScript() {
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

async function loadCapWidget() {
  window.CAP_CUSTOM_WASM_URL = localCapAsset('cap_wasm_bg.wasm');
  window.CAP_PAKO_URL = localCapAsset('pako_inflate.min.js');
  window.CAP_DISABLE_WIDGET_REF = true;
  window.CAP_DEBUG = import.meta.env.DEV;

  installCapFetchDiagnostics();
  await assertCapReady();
  await loadCapScript();
}

const CapCaptcha = forwardRef(function CapCaptcha(
  { onToken, disabled = false },
  forwardedRef
) {
  const widgetRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

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

    setReady(false);
    setError('');
    window.__SAGC_CAP_LAST_ERROR = '';

    loadCapWidget()
      .then(() => {
        if (active) {
          setReady(true);
          setError('');
        }
      })
      .catch((loadError) => {
        if (active) {
          setReady(false);
          setError(
            loadError?.message ||
              'No fue posible cargar la verificación CAP local.'
          );
        }
      });

    return () => {
      active = false;
    };
  }, [retryKey]);

  useEffect(() => {
    if (!ready) return undefined;

    const widget = widgetRef.current;
    if (!widget) return undefined;

    function handleSolve(event) {
      window.__SAGC_CAP_LAST_ERROR = '';
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

      const diagnostic = String(window.__SAGC_CAP_LAST_ERROR || '').trim();
      setError(
        diagnostic ||
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

      {!ready && !error ? (
        <span className="cap-captcha-status">Comprobando CAP…</span>
      ) : progress > 0 && progress < 100 ? (
        <span className="cap-captcha-status">
          Verificación {Math.round(progress)}%
        </span>
      ) : null}

      {error ? (
        <div className="cap-captcha-diagnostic" role="alert">
          <span className="cap-captcha-error">{error}</span>
          {!ready ? (
            <button
              type="button"
              className="cap-captcha-retry"
              onClick={() => setRetryKey((current) => current + 1)}
              disabled={disabled}
            >
              Reintentar CAP
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

export default CapCaptcha;
