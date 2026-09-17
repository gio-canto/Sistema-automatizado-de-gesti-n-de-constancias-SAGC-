import { useEffect, useState } from 'react';
import { createAdminEvent, fetchAdminEvents, updateAdminEvent } from '../../services/admin.js';
import { notify } from '../../lib/notify.js';

const demoEvents = [
  { id_evento: 1, codigo: 'DEMO-001', nombre: 'Evento de demostración SAGC', lugar: 'Chilpancingo', estado: 'ACTIVO', fecha_inicio: '2026-09-17', fecha_fin: '2026-09-17' },
];

export default function AdminEventsView({ demo, onSessionExpired }) {
  const [events, setEvents] = useState(demo ? demoEvents : []);
  const [loading, setLoading] = useState(!demo);
  const [form, setForm] = useState({ codigo: '', nombre: '', lugar: '', fecha_inicio: '', fecha_fin: '', estado: 'BORRADOR' });

  async function load() {
    if (demo) return setEvents(demoEvents);
    setLoading(true);
    try { setEvents(await fetchAdminEvents()); }
    catch (error) {
      if (error.status === 401 || error.status === 403) return onSessionExpired?.();
      notify.error('Eventos', error.message);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [demo]);

  async function submit(event) {
    event.preventDefault();
    if (demo) {
      setEvents((current) => [{ id_evento: Date.now(), ...form }, ...current]);
      setForm({ codigo: '', nombre: '', lugar: '', fecha_inicio: '', fecha_fin: '', estado: 'BORRADOR' });
      return notify.success('Evento demo creado');
    }
    try {
      await createAdminEvent(form);
      notify.success('Evento creado', 'El evento quedó disponible en SAGC.');
      setForm({ codigo: '', nombre: '', lugar: '', fecha_inicio: '', fecha_fin: '', estado: 'BORRADOR' });
      await load();
    } catch (error) { notify.error('No se pudo crear el evento', error.message); }
  }

  async function changeState(item, estado) {
    if (demo) {
      setEvents((current) => current.map((event) => event.id_evento === item.id_evento ? { ...event, estado } : event));
      return;
    }
    try { await updateAdminEvent(item.id_evento, { estado }); await load(); notify.success('Estado actualizado'); }
    catch (error) { notify.error('No se pudo actualizar', error.message); }
  }

  return (
    <div className="apple-view">
      <header className="apple-view__hero"><div><span>GESTIÓN</span><h1>Eventos</h1><p>Crea eventos, define fechas y controla su ciclo de vida antes de emitir documentos.</p></div></header>
      <div className="apple-two-column apple-two-column--events">
        <section className="apple-panel">
          <div className="apple-panel__title"><div><span>NUEVO EVENTO</span><h2>Datos generales</h2></div></div>
          <form className="apple-form" onSubmit={submit}>
            <div className="apple-form__row"><label><span>Código</span><input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="FORO-2026" required /></label><label><span>Estado inicial</span><select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}><option>BORRADOR</option><option>ACTIVO</option></select></label></div>
            <label><span>Nombre</span><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre oficial del evento" required /></label>
            <label><span>Lugar</span><input value={form.lugar} onChange={(e) => setForm({ ...form, lugar: e.target.value })} placeholder="Lugar o modalidad" /></label>
            <div className="apple-form__row"><label><span>Inicio</span><input type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} /></label><label><span>Fin</span><input type="date" value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} /></label></div>
            <button className="apple-primary-button" type="submit">Crear evento</button>
          </form>
        </section>
        <section className="apple-panel">
          <div className="apple-panel__title"><div><span>EVENTOS</span><h2>{events.length} registros</h2></div><button type="button" onClick={load}>Actualizar</button></div>
          <div className="apple-event-list">
            {loading ? <p className="apple-empty">Cargando eventos…</p> : events.map((item) => (
              <article key={item.id_evento}>
                <div className="apple-event-list__date"><strong>{item.fecha_inicio ? new Date(`${item.fecha_inicio}T12:00:00`).getDate() : '—'}</strong><span>{item.fecha_inicio ? new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(new Date(`${item.fecha_inicio}T12:00:00`)) : 'sin fecha'}</span></div>
                <div><strong>{item.nombre}</strong><small>{item.codigo} · {item.lugar || 'Sin lugar'}</small></div>
                <select value={item.estado} onChange={(e) => changeState(item, e.target.value)}><option>BORRADOR</option><option>ACTIVO</option><option>CERRADO</option><option>CANCELADO</option></select>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
