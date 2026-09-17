import { useEffect, useState } from 'react';
import {
  createAdminUser,
  fetchAdminUsers,
  resetAdminUserPassword,
  updateAdminUser,
} from '../../services/admin.js';
import { notify } from '../../lib/notify.js';
import { PasswordStrengthField, UserBlobatar } from '../ui/ReferenceControls.jsx';

const demoUsers = [
  { id_usuario: 1, nombre: 'Juan Alberto', usuario: 'juan.alberto', permiso: 'ADMIN', activo: true },
  { id_usuario: 2, nombre: 'Edgar Osmar', usuario: 'edgar.osmar', permiso: 'NORMAL', activo: true },
];

export default function AdminUsersView({ demo, elevated, onRequireElevated, onSessionExpired }) {
  const [users, setUsers] = useState(demo ? demoUsers : []);
  const [loading, setLoading] = useState(!demo);
  const [form, setForm] = useState({ nombre: '', usuario: '', password: '', permiso: 'NORMAL' });
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');

  async function load() {
    if (demo) return setUsers(demoUsers);
    setLoading(true);
    try { setUsers(await fetchAdminUsers()); }
    catch (error) {
      if (error.status === 401 || error.status === 403) return onSessionExpired?.();
      notify.error('Usuarios', error.message);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [demo]);

  function secure(action) {
    if (demo || elevated) return action();
    onRequireElevated?.(action);
  }

  async function submitUser(event) {
    event.preventDefault();
    secure(async () => {
      if (demo) {
        setUsers((current) => [...current, { id_usuario: Date.now(), nombre: form.nombre || 'Usuario Demo', usuario: form.usuario || 'demo.user', permiso: form.permiso, activo: true }]);
        setForm({ nombre: '', usuario: '', password: '', permiso: 'NORMAL' });
        return notify.success('Usuario demo creado', 'No se guardó en Supabase.');
      }
      try {
        await createAdminUser(form);
        notify.success('Usuario creado', 'La cuenta quedó disponible en SAGC.');
        setForm({ nombre: '', usuario: '', password: '', permiso: 'NORMAL' });
        await load();
      } catch (error) { notify.error('No se pudo crear el usuario', error.message); }
    });
  }

  function changeUser(user, patch) {
    secure(async () => {
      if (demo) {
        setUsers((current) => current.map((item) => item.id_usuario === user.id_usuario ? { ...item, ...patch } : item));
        return;
      }
      try { await updateAdminUser(user.id_usuario, patch); await load(); notify.success('Usuario actualizado'); }
      catch (error) { notify.error('No se pudo actualizar', error.message); }
    });
  }

  function resetPasswordNow() {
    if (!resetTarget || !resetPassword) return;
    secure(async () => {
      if (demo) { setResetTarget(null); setResetPassword(''); return notify.success('Contraseña demo actualizada'); }
      try {
        await resetAdminUserPassword(resetTarget.id_usuario, resetPassword);
        notify.success('Contraseña restablecida');
        setResetTarget(null); setResetPassword('');
      } catch (error) { notify.error('No se pudo restablecer', error.message); }
    });
  }

  return (
    <div className="apple-view">
      <header className="apple-view__hero"><div><span>GESTIÓN</span><h1>Usuarios</h1><p>Administra cuentas, permisos y estado de acceso. Los cambios sensibles requieren modo elevado.</p></div><span className={`apple-secure-badge ${elevated ? 'is-unlocked' : ''}`}>{elevated ? 'Desbloqueado' : 'Protegido'}</span></header>

      <div className="apple-two-column apple-two-column--users">
        <section className={`apple-panel apple-sensitive-zone ${elevated || demo ? 'is-unlocked' : ''}`}>
          <div className="apple-panel__title"><div><span>NUEVA CUENTA</span><h2>Crear usuario</h2></div></div>
          <form className="apple-form" onSubmit={submitUser}>
            <label><span>Nombre completo</span><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del usuario" required /></label>
            <label><span>Usuario</span><input value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })} placeholder="nombre.usuario" required /></label>
            <PasswordStrengthField value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <label><span>Permiso</span><select value={form.permiso} onChange={(e) => setForm({ ...form, permiso: e.target.value })}><option value="NORMAL">NORMAL</option><option value="ADMIN">ADMIN</option></select></label>
            <button className="apple-primary-button" type="submit">Crear usuario</button>
          </form>
          {!elevated && !demo ? <button className="apple-sensitive-zone__lock" type="button" onClick={() => onRequireElevated?.()}>⌾<strong>Desbloquear creación</strong><span>Confirma tu contraseña</span></button> : null}
        </section>

        <section className="apple-panel">
          <div className="apple-panel__title"><div><span>CUENTAS</span><h2>{users.length} usuarios</h2></div><button type="button" onClick={load}>Actualizar</button></div>
          <div className="apple-user-list">
            {loading ? <p className="apple-empty">Cargando usuarios…</p> : users.map((item) => (
              <article key={item.id_usuario}>
                {item.foto_url ? <img src={item.foto_url} alt="" /> : <UserBlobatar name={item.usuario} size={42} />}
                <div><strong>{item.nombre}</strong><small>@{item.usuario}</small></div>
                <select value={item.permiso} onChange={(e) => changeUser(item, { permiso: e.target.value })}><option>NORMAL</option><option>ADMIN</option></select>
                <button className={item.activo ? 'is-active' : 'is-disabled'} type="button" onClick={() => changeUser(item, { activo: !item.activo })}>{item.activo ? 'Activo' : 'Inactivo'}</button>
                <button type="button" onClick={() => setResetTarget(item)}>Contraseña</button>
              </article>
            ))}
          </div>
        </section>
      </div>

      {resetTarget ? (
        <div className="apple-inline-dialog">
          <div><span>SEGURIDAD</span><h3>Restablecer contraseña</h3><p>{resetTarget.nombre}</p></div>
          <PasswordStrengthField value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} label="Nueva contraseña" />
          <div><button type="button" className="secondary" onClick={() => { setResetTarget(null); setResetPassword(''); }}>Cancelar</button><button type="button" className="primary" onClick={resetPasswordNow}>Restablecer</button></div>
        </div>
      ) : null}
    </div>
  );
}
