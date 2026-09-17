# SAGC — Guía de la Consola Administrativa

La Consola Administrativa es el centro de control para usuarios con permiso `ADMIN`.

No es una terminal de sistema y no permite ejecutar comandos arbitrarios, SQL, JavaScript ni código del servidor. Todas sus capacidades se exponen mediante acciones y endpoints definidos por SAGC.

## Acceso

Ruta lógica:

```text
Login ADMIN
  ↓
Admin
  ↓
Consola
```

Un usuario `NORMAL` no debe ver la entrada administrativa y el backend rechaza cualquier llamada directa al endpoint de consola con `403`.

## Seguridad

La consola utiliza una sesión de backend basada en una cookie:

```text
sagc_session
```

Características actuales:

- token aleatorio de 32 bytes;
- cookie `HttpOnly`;
- `SameSite=Strict`;
- `Secure` cuando `NODE_ENV=production`;
- expiración de sesión;
- cierre de sesión desde backend;
- protección adicional por rol `ADMIN`;
- límite temporal de intentos fallidos de login;
- credenciales de Supabase únicamente en Express;
- nunca se envía `SUPABASE_SECRET_KEY` al navegador.

La sesión actual se conserva en memoria del proceso Node. Reiniciar el backend invalida las sesiones activas. Para un despliegue distribuido futuro deberá utilizarse un almacén de sesiones compartido.

## Endpoint principal

```http
GET /api/admin/console/summary
```

Requiere:

```text
sesión válida
+
permiso ADMIN
```

No recibe SQL ni parámetros ejecutables.

## Información visible

La consola presenta información administrativa de solo lectura:

- estado de la API;
- estado de Supabase/PostgreSQL;
- entorno Node;
- tiempo activo de la API;
- usuarios totales y activos;
- administradores activos;
- eventos totales y activos;
- plantillas activas;
- constancias registradas y emitidas;
- contador de folios del año actual;
- última constancia emitida;
- actividad reciente de auditoría.

No muestra:

- contraseñas;
- hashes de contraseña;
- `SUPABASE_SECRET_KEY`;
- variables de entorno secretas;
- contenido arbitrario de la base de datos;
- consola SQL;
- shell del sistema operativo.

## Accesos directos

La consola incluye accesos a:

```text
Usuarios
Crear usuario
Eventos
Plantillas
Registrar
Auditoría
```

Los módulos que todavía no existen muestran un aviso Sileo y se conectarán conforme se implementen las siguientes pantallas.

`Registrar` ya puede regresar al menú operativo SAGC.

## Actualización de estado

El botón de recarga consulta nuevamente:

```http
GET /api/admin/console/summary
```

La interfaz no reutiliza métricas antiguas como si fueran actuales.

## Archivos principales

Frontend:

```text
src/pages/AdminConsolePage.jsx
src/services/admin.js
src/styles/admin-console.css
src/pages/AccessGrantedPage.jsx
```

Backend:

```text
server/src/index.js
server/src/security/session-store.js
server/src/security/login-guard.js
server/src/services/admin/console.js
```

## Validación

El repositorio dispone ahora de:

```bash
npm run server:check
```

El workflow de GitHub ejecuta antes del build:

```text
npm install
npm run server:check
npm run folio:test
npm run token:test
npm run chain:test
npm run build
```

De esta forma una rotura de sintaxis en Express o en los módulos de seguridad detiene el despliegue antes de publicar Vite.

## Uso local

Primera instalación o después de cambiar dependencias:

```bash
npm install
```

Terminal 1:

```bash
npm run dev
```

Terminal 2:

```bash
npm run server:dev
```

Frontend:

```text
http://localhost:5173/
```

Backend:

```text
http://localhost:3001/
```

Para probar los datos reales de la consola debe iniciarse sesión con una cuenta real cuyo campo `usuarios.permiso` sea `ADMIN`.

El acceso `demo/demo` mantiene una vista visual de demostración y no expone datos reales de Supabase.
