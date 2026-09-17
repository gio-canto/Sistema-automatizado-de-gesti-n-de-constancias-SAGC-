import { useMemo, useState } from 'react';
import { runAdminConsoleCommand } from '../../services/admin.js';

const ALLOWED = [
  ['status', 'Estado general'],
  ['health', 'Salud del sistema'],
  ['users.count', 'Conteo de usuarios'],
  ['events.count', 'Conteo de eventos'],
  ['folios.current', 'Folio actual'],
  ['audit.latest', 'Auditoría reciente'],
];

export default function LimitedConsolePanel({ demo = false }) {
  const [command, setCommand] = useState('status');
  const [history, setHistory] = useState([
    { command: 'help', title: 'SAGC Limited Console', lines: ['Solo admite comandos autorizados por el backend.', 'No ejecuta SQL, shell ni JavaScript arbitrario.'] },
  ]);
  const [busy, setBusy] = useState(false);

  const prompt = useMemo(() => `admin@sagc › ${command}`, [command]);

  async function run() {
    if (busy) return;
    setBusy(true);
    try {
      let result;
      if (demo) {
        result = { command, title: 'Modo demostración', lines: ['El backend real no está conectado en esta vista.', `Comando aceptado: ${command}`] };
      } else {
        result = await runAdminConsoleCommand(command);
      }
      setHistory((current) => [...current.slice(-5), result]);
    } catch (error) {
      setHistory((current) => [...current.slice(-5), { command, title: 'Error', lines: [error.message] }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="apple-limited-console">
      <header>
        <div className="apple-limited-console__traffic"><i /><i /><i /></div>
        <strong>Consola limitada</strong>
        <span>solo lectura</span>
      </header>
      <div className="apple-limited-console__body">
        {history.map((item, index) => (
          <div className="apple-limited-console__entry" key={`${item.command}-${index}`}>
            <code>admin@sagc › {item.command}</code>
            <strong>{item.title}</strong>
            {(item.lines || []).map((line, lineIndex) => <span key={lineIndex}>{line}</span>)}
          </div>
        ))}
      </div>
      <div className="apple-limited-console__controls">
        <select value={command} onChange={(event) => setCommand(event.target.value)} aria-label="Comando permitido">
          {ALLOWED.map(([value, label]) => <option key={value} value={value}>{value} — {label}</option>)}
        </select>
        <button type="button" onClick={run} disabled={busy}>{busy ? 'Ejecutando…' : 'Ejecutar'}</button>
      </div>
      <small>{prompt}</small>
    </section>
  );
}
