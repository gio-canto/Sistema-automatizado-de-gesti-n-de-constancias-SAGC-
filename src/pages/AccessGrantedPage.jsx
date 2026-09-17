import { useMemo, useState } from 'react';
import InstitutionalHeader from '../components/layout/InstitutionalHeader.jsx';
import WorkspaceCard from '../components/ui/WorkspaceCard.jsx';
import { notify } from '../lib/notify.js';

const DOCUMENT_TYPES = [
  {
    id: 'constancia',
    title: 'Constancia',
    icon: 'document',
  },
  {
    id: 'diploma',
    title: 'Diploma',
    icon: 'diploma',
  },
  {
    id: 'reconocimiento',
    title: 'Reconocimiento',
    icon: 'recognition',
  },
  {
    id: 'acreditacion',
    title: 'Acreditación',
    icon: 'accreditation',
  },
  {
    id: 'personalizado',
    title: 'Otros / Personalizado',
    icon: 'other',
    wide: true,
  },
];

function BackButton({ onClick }) {
  return (
    <button className="workspace-back" type="button" onClick={onClick}>
      <span aria-hidden="true">←</span>
      Volver
    </button>
  );
}

export default function AccessGrantedPage({ user, onLogout }) {
  const role = String(user?.permiso || 'NORMAL').toUpperCase();
  const isAdmin = role === 'ADMIN' || role === 'DEMO';
  const [view, setView] = useState(isAdmin ? 'home' : 'sagc');

  const title = useMemo(() => {
    if (view === 'admin') return 'Administración';
    if (view === 'sagc') return 'Sistema automatizado de gestión de constancias (SAGC)';
    return 'Selecciona el área de trabajo';
  }, [view]);

  function pendingModule(label) {
    notify.info(
      `${label} · siguiente etapa`,
      'La navegación ya está preparada. Implementaremos este módulo en la siguiente pantalla.'
    );
  }

  return (
    <main className="workspace-shell">
      <InstitutionalHeader user={user} onLogout={onLogout} />

      <section className="workspace-content">
        <div className="workspace-content__topline">
          {isAdmin && view !== 'home' ? (
            <BackButton onClick={() => setView('home')} />
          ) : (
            <span />
          )}
          <span className="workspace-role-note">
            {isAdmin ? 'Acceso administrativo' : 'Acceso operativo'}
          </span>
        </div>

        <header className="workspace-heading">
          <p className="workspace-heading__eyebrow">
            {view === 'admin' ? 'ADMIN' : view === 'sagc' ? 'SAGC' : 'INICIO'}
          </p>
          <h1>{title}</h1>
          <p>
            {view === 'home'
              ? 'Elige entre las herramientas administrativas y el registro de documentos.'
              : view === 'admin'
                ? 'Herramientas reservadas para usuarios con permisos de administrador.'
                : 'Selecciona el tipo de documento que deseas registrar.'}
          </p>
        </header>

        {view === 'home' ? (
          <div className="workspace-grid workspace-grid--gateway">
            <WorkspaceCard
              title="Admin"
              description="Usuarios, permisos y herramientas administrativas."
              actionLabel="Crear"
              icon="admin"
              tone="dark"
              onClick={() => setView('admin')}
            />
            <WorkspaceCard
              title="SAGC"
              description="Registro y emisión de constancias y documentos."
              actionLabel="Registrar"
              icon="document"
              tone="blue"
              onClick={() => setView('sagc')}
            />
          </div>
        ) : null}

        {view === 'admin' ? (
          <div className="workspace-grid workspace-grid--admin">
            <WorkspaceCard
              title="Consola"
              description="Acceso a las herramientas administrativas del sistema."
              actionLabel="Ingresar"
              icon="console"
              tone="dark"
              onClick={() => pendingModule('Consola')}
            />
            <WorkspaceCard
              title="Crear usuario"
              description="Alta de cuentas y asignación inicial de permisos."
              actionLabel="Crear"
              icon="user"
              tone="green"
              onClick={() => pendingModule('Crear usuario')}
            />
          </div>
        ) : null}

        {view === 'sagc' ? (
          <div className="workspace-grid workspace-grid--documents">
            {DOCUMENT_TYPES.map((item) => (
              <WorkspaceCard
                key={item.id}
                title={item.title}
                actionLabel="Registrar"
                icon={item.icon}
                wide={item.wide}
                tone="blue"
                onClick={() => pendingModule(item.title)}
              />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
