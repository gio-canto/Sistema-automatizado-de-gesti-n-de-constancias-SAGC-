import { useEffect, useMemo, useRef, useState } from 'react';
import { runAdminConsoleCommand } from '../../services/admin.js';

const COMMANDS = [
  'help',
  'status',
  'health',
  'whoami',
  'date',
  'uptime',
  'users.count',
  'users.list',
  'users.list --active',
  'users.list --admins',
  'users.show ',
  'user.enable ',
  'user.disable ',
  'user.role ',
  'events.count',
  'events.list',
  'events.list --state ACTIVO',
  'events.show ',
  'event.state ',
  'templates.list',
  'templates.list --active',
  'documents.list',
  'documents.list --state EMITIDA',
  'documents.show ',
  'folios.current',
  'audit.latest',
  'security.status',
  'sessions.list',
  'security.clear-login-blocks',
  'security.logout-others',
];

const DEMO_HELP = [
  'help | status | health | whoami | date | uptime',
  'users.count | users.list | users.show <id>',
  'events.count | events.list | events.show <id>',
  'templates.list | documents.list | folios.current',
  'audit.latest | security.status | sessions.list',
  'Los comandos con cambios reales requieren backend y modo elevado.',
];

function demoResult(command) {
  const normalized = command.trim().toLowerCase();
  if (normalized === 'help' || normalized === 'commands') {
    return { command, title: 'Comandos de demostración', lines: DEMO_HELP };
  }
  if (normalized === 'status') {
    return { command, title: 'Estado SAGC', lines: ['API: demo', 'Base: Supabase / PostgreSQL', 'Usuarios activos: 2', 'Eventos activos: 1'] };
  }
  if (normalized === 'health') {
    return { command, title: 'Health check', lines: ['Frontend: Vite', 'Backend real: no conectado en demo', 'Esquema: public'] };
  }
  if (normalized === 'whoami') {
    return { command, title: 'Sesión actual', lines: ['Usuario: demo', 'Permiso: DEMO', 'Modo elevado: simulado'] };
  }
  if (normalized === 'date') return { command, title: 'Fecha', lines: [new Date().toISOString()] };
  if (normalized === 'uptime') return { command, title: 'Tiempo activo', lines: ['0s · modo demostración'] };
  return { command, title: 'Modo demostración', lines: [`Comando recibido: ${command}`, 'La ejecución real requiere una sesión ADMIN conectada al backend.'] };
}

export default function LimitedConsolePanel({
  demo = false,
  elevated = false,
  onRequireElevation,
}) {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([
    {
      command: 'help',
      title: 'SAGC Admin Terminal',
      lines: [
        'Consola administrativa delimitada lista.',
        'Escriba help para ver comandos permitidos.',
        'No ejecuta shell, SQL, pipes, redirecciones ni código arbitrario.',
      ],
    },
  ]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  const prompt = useMemo(
    () => `${elevated ? 'root' : 'admin'}@sagc ›`,
    [elevated]
  );

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, busy]);

  async function execute(rawValue = command) {
    const raw = String(rawValue || '').trim();
    if (!raw || busy) return;

    if (raw.toLowerCase() === 'clear') {
      setHistory([]);
      setCommand('');
      setHistoryIndex(-1);
      return;
    }

    setBusy(true);
    setCommandHistory((current) => [...current.filter((item) => item !== raw), raw].slice(-50));
    setHistoryIndex(-1);
    setCommand('');

    try {
      const result = demo ? demoResult(raw) : await runAdminConsoleCommand(raw);
      setHistory((current) => [...current.slice(-39), result]);
    } catch (error) {
      if (error?.requiresReauth) {
        setHistory((current) => [
          ...current.slice(-39),
          {
            command: raw,
            title: 'Modo elevado requerido',
            lines: ['Este comando necesita confirmar la contraseña ADMIN.', 'Desbloquee el modo elevado y vuelva a ejecutarlo.'],
            tone: 'warning',
          },
        ]);
        onRequireElevation?.();
      } else {
        setHistory((current) => [
          ...current.slice(-39),
          { command: raw, title: 'Error', lines: [error.message], tone: 'error' },
        ]);
      }
    } finally {
      setBusy(false);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  function autocomplete() {
    const current = command.trimStart().toLowerCase();
    if (!current) {
      setCommand('help');
      return;
    }
    const matches = COMMANDS.filter((item) => item.toLowerCase().startsWith(current));
    if (matches.length === 1) {
      setCommand(matches[0]);
      return;
    }
    if (matches.length > 1) {
      setHistory((items) => [
        ...items.slice(-39),
        { command, title: 'Sugerencias', lines: matches.slice(0, 12) },
      ]);
    }
  }

  function onKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      execute();
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      autocomplete();
      return;
    }
    if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      setHistory([]);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!commandHistory.length) return;
      const next = Math.min(commandHistory.length - 1, historyIndex + 1);
      setHistoryIndex(next);
      setCommand(commandHistory[commandHistory.length - 1 - next]);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setCommand('');
        return;
      }
      const next = historyIndex - 1;
      setHistoryIndex(next);
      setCommand(commandHistory[commandHistory.length - 1 - next]);
    }
  }

  return (
    <section className="apple-limited-console apple-limited-console--terminal">
      <header>
        <div className="apple-limited-console__traffic" aria-hidden="true"><i /><i /><i /></div>
        <strong>SAGC Admin Terminal</strong>
        <span>{elevated ? 'elevada · delimitada' : 'delimitada'}</span>
      </header>

      <div className="apple-limited-console__body" ref={bodyRef} onClick={() => inputRef.current?.focus()}>
        {history.map((item, index) => (
          <div className={`apple-limited-console__entry ${item.tone ? `is-${item.tone}` : ''}`} key={`${item.command}-${index}`}>
            <code>{prompt} {item.command}</code>
            <strong>{item.title}</strong>
            {(item.lines || []).map((line, lineIndex) => <span key={lineIndex}>{line || ' '}</span>)}
          </div>
        ))}
        {busy ? (
          <div className="apple-limited-console__entry is-running">
            <code>{prompt}</code>
            <span>Ejecutando comando permitido…</span>
          </div>
        ) : null}
      </div>

      <div className="apple-limited-console__input-row">
        <span className={elevated ? 'is-elevated' : ''}>{prompt}</span>
        <input
          ref={inputRef}
          autoFocus
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          onKeyDown={onKeyDown}
          disabled={busy}
          spellCheck="false"
          autoComplete="off"
          aria-label="Comando administrativo SAGC"
          placeholder="Escribe un comando…"
        />
        <button type="button" onClick={() => execute()} disabled={!command.trim() || busy}>
          {busy ? '…' : '↵'}
        </button>
      </div>

      <footer className="apple-limited-console__footer">
        <span>Enter ejecutar</span>
        <span>Tab completar</span>
        <span>↑↓ historial</span>
        <span>Ctrl+L limpiar</span>
        <span>help comandos</span>
      </footer>
    </section>
  );
}
