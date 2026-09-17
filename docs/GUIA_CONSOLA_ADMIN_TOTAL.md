# SAGC — Guía de Consola Administrativa Total

La Consola Administrativa de SAGC es un centro de control visual para usuarios `ADMIN`. Está diseñada con una experiencia inspirada en macOS: sidebar persistente, superficies translúcidas, tarjetas, topbar y acciones sensibles protegidas mediante reautenticación.

## Principio de seguridad

La consola es **total en visibilidad y gestión, pero limitada en ejecución**.

No ofrece:

- SQL arbitrario;
- shell del sistema operativo;
- ejecución libre de JavaScript;
- acceso a `SUPABASE_SECRET_KEY`;
- edición directa de tablas sin validación;
- acciones sensibles sin reautenticación.

Sí ofrece operaciones explícitas y auditables mediante endpoints definidos por SAGC.

## Navegación

```text
General
├── Inicio
├── Actividad
└── Terminal administrativa

Gestión
├── Usuarios
├── Eventos
├── Plantillas
└── Documentos

Control
├── Auditoría
├── Sistema
└── Seguridad

Preferencias
├── Configuración
└── Soporte
```

## Modo elevado

La sesión normal `ADMIN` permite consultar y operar funciones ordinarias.

Las acciones sensibles requieren una segunda verificación de contraseña:

```text
ADMIN autenticado
      ↓
acción sensible
      ↓
modal de reautenticación
      ↓
contraseña válida
      ↓
modo elevado por 10 minutos
```

El modo elevado se utiliza para:

- crear usuarios;
- cambiar permisos;
- activar o desactivar cuentas;
- restablecer contraseñas;
- cambiar estados sensibles desde terminal;
- limpiar bloqueos de login;
- cerrar otras sesiones.

Puede bloquearse manualmente antes de que expire.

## Sesiones

La sesión utiliza una cookie:

```text
sagc_session
```

con:

- `HttpOnly`;
- `SameSite=Strict`;
- `Secure` en producción;
- expiración de 8 horas;
- token aleatorio generado en backend.

En la etapa actual las sesiones viven en memoria de Express, por lo que reiniciar el backend invalida las sesiones existentes.

## Terminal administrativa delimitada

La vista `Consola` es ahora una terminal escrita completa dentro del lenguaje SAGC.

Permite:

- escribir comandos manualmente;
- ejecutar con Enter;
- autocompletar con Tab;
- navegar historial con `↑` y `↓`;
- limpiar con `Ctrl+L` o `clear`;
- consultar usuarios, eventos, plantillas, documentos, folios, auditoría, seguridad y sesiones;
- ejecutar algunas modificaciones controladas cuando el modo elevado está activo.

Ejemplos:

```text
help
status
users.list --active --limit 25
users.show admin
events.list --state ACTIVO
documents.show 2026-A-0001
audit.latest --limit 50
security.status
```

Comandos sensibles de ejemplo:

```text
user.disable 12
user.role 12 ADMIN
event.state 5 CERRADO
security.clear-login-blocks
security.logout-others
```

No existe evaluación de texto como código. El backend tokeniza y valida el comando y solo ejecuta operaciones registradas explícitamente.

No se aceptan pipes, redirecciones, operadores de shell ni comandos multilínea.

La especificación completa está en:

```text
docs/GUIA_TERMINAL_ADMIN_DELIMITADA.md
```

## Usuarios

La vista permite:

- listar cuentas;
- crear una cuenta;
- asignar `NORMAL` o `ADMIN`;
- activar/desactivar;
- restablecer contraseña.

La contraseña se almacena con Argon2id y debe tener al menos 12 caracteres.

## Eventos

Permite:

- crear eventos;
- definir código, nombre, lugar y fechas;
- iniciar como `BORRADOR` o `ACTIVO`;
- cambiar el estado entre `BORRADOR`, `ACTIVO`, `CERRADO` y `CANCELADO`.

## Plantillas

Muestra el catálogo de plantillas con:

- nombre;
- versión;
- modo;
- orientación;
- tamaño;
- estado activo/inactivo.

Esta etapa es de consulta; la edición visual de plantillas se añadirá en su módulo específico.

## Documentos

Permite consultar emisiones recientes mostrando:

- folio;
- persona;
- estado;
- fecha;
- token UUIDv4 abreviado.

El acceso `Registrar documento` vuelve al flujo SAGC de emisión.

## Auditoría

La consola consulta `public.auditoria` y muestra:

- acción;
- entidad;
- usuario;
- IP;
- fecha.

Las acciones administrativas sensibles se registran en esta tabla, incluidas las modificaciones realizadas desde la terminal.

## Sistema

Muestra:

- estado API;
- versión de Node.js;
- entorno;
- uptime;
- memoria RSS;
- Supabase/PostgreSQL;
- esquema;
- sesiones activas.

## Seguridad

Muestra:

- sesiones activas;
- sesiones ADMIN;
- sesiones elevadas;
- intentos de login vigilados;
- bloqueos temporales;
- política de sesiones.

Acciones disponibles en modo elevado:

- limpiar bloqueos temporales;
- cerrar todas las demás sesiones;
- bloquear manualmente el modo elevado.

## Configuración

Por ahora contiene preferencias locales seguras:

- apariencia clara/oscura;
- densidad cómoda/compacta.

Se guardan en `localStorage` y no modifican infraestructura ni secretos.

## Archivos principales

```text
src/components/admin/
├── AdminShell.jsx
├── AdminDashboardView.jsx
├── AdminUsersView.jsx
├── AdminEventsView.jsx
├── AdminDataViews.jsx
├── LimitedConsolePanel.jsx
└── SecureActionModal.jsx

src/pages/
└── AdminConsolePage.jsx

src/services/
└── admin.js

src/styles/
├── admin-suite.css
├── console-layout.css
└── terminal-console.css

server/src/security/
├── session-store.js
└── login-guard.js

server/src/services/admin/
├── console.js
├── operations.js
└── command-console.js
```

## Endpoints administrativos

```text
GET    /api/admin/console/summary
POST   /api/admin/console/command

POST   /api/admin/security/reauth
POST   /api/admin/security/lock
GET    /api/admin/security/status
POST   /api/admin/security/clear-login-blocks
POST   /api/admin/security/logout-others

GET    /api/admin/system/health

GET    /api/admin/users
POST   /api/admin/users
PATCH  /api/admin/users/:id
POST   /api/admin/users/:id/reset-password

GET    /api/admin/events
POST   /api/admin/events
PATCH  /api/admin/events/:id

GET    /api/admin/templates
GET    /api/admin/documents
GET    /api/admin/audit
```

Todos los endpoints `/api/admin/*` requieren una sesión válida y permiso `ADMIN`. Las rutas sensibles y los comandos sensibles además exigen modo elevado.

## Desarrollo local

Terminal 1:

```bash
npm run dev
```

Terminal 2:

```bash
npm run server:dev
```

El frontend continúa en `http://localhost:5173/` y la API en `http://localhost:3001/`.