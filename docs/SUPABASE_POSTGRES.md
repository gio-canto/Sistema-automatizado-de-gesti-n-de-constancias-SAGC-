# Supabase + PostgreSQL para SAGC

Esta es la guía oficial de base de datos del proyecto.

## Arquitectura

```text
React / Vite (:5173)
        |
        | HTTP / JSON
        v
SAGC API Node.js (:3001)
        |
        | @supabase/supabase-js
        v
Supabase Data API
        |
        v
PostgreSQL
```

React no recibe la clave secreta de Supabase.

## 1. Crear proyecto

1. Crear o abrir el proyecto de Supabase asignado a SAGC.
2. Esperar a que PostgreSQL esté disponible.
3. Abrir **SQL Editor**.

La base se administra desde Supabase; para el flujo normal no se requiere un servidor de base de datos local.

## 2. Crear el esquema

En **SQL Editor**, ejecutar el contenido de:

```text
database/schema.sql
```

Después ejecutar:

```text
database/002_seed_catalogos.sql
database/004_smoke_test.sql
```

El smoke test debe mostrar PostgreSQL, el esquema `public`, las tablas SAGC y el estado del contador de folios.

## 3. Obtener credenciales del backend

Desde el panel del proyecto, obtener:

```text
Project URL
Secret key
```

Para proyectos nuevos se espera una clave con formato similar a:

```text
sb_secret_...
```

La clave secreta tiene acceso elevado y solo debe utilizarse en el servidor.

## 4. Configurar server/.env

Desde la raíz:

### Windows

```powershell
Copy-Item server/.env.example server/.env
```

### macOS / Linux

```bash
cp server/.env.example server/.env
```

Editar:

```dotenv
SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=sb_secret_TU_CLAVE_REAL
```

Nunca subir `server/.env`.

## 5. Instalar dependencias

```bash
npm run setup:project
```

El backend utiliza:

```text
@supabase/supabase-js
Express
Argon2
dotenv
cors
helmet
```

## 6. Probar conexión

```bash
npm run db:check
```

Resultado esperado:

```text
Conexión Supabase/PostgreSQL correcta.
```

También puede consultarse:

```text
http://localhost:3001/api/health/db
```

## 7. Crear primer administrador

En `server/.env`:

```dotenv
SAGC_BOOTSTRAP_ADMIN_NAME=Administrador SAGC
SAGC_BOOTSTRAP_ADMIN_USER=admin
SAGC_BOOTSTRAP_ADMIN_PASSWORD=UNA_CONTRASENA_DE_12_O_MAS_CARACTERES
```

Después:

```bash
npm run db:bootstrap-admin
```

El script genera Argon2id localmente en Node.js y guarda solamente `password_hash` mediante Supabase.

## 8. RLS y permisos

El esquema habilita RLS en las tablas SAGC y revoca el acceso directo a `anon` y `authenticated` durante esta etapa.

La clave secreta del backend opera con acceso elevado. Por eso:

- jamás debe exponerse al navegador;
- jamás debe guardarse en Git;
- las rutas Express deben validar autorización antes de realizar acciones sensibles.

## 9. Folios

La función PostgreSQL:

```text
public.asignar_siguiente_folio(date)
```

se llama desde Node con:

```text
supabase.rpc(...)
```

Así PostgreSQL controla el bloqueo y el incremento del contador.

## 10. Token Único SAGC

El token oficial utiliza **UUID versión 4**.

```text
7f0c55ca-3ac5-49a0-8b86-98dd96cef072
```

PostgreSQL almacena:

```sql
token_unico uuid not null unique
```

y el esquema valida específicamente que el UUID corresponda a versión 4.

El backend genera el valor con:

```js
crypto.randomUUID()
```

Metodología completa:

```text
docs/METODOLOGIA_TOKEN_UNICO.md
```

Prueba:

```bash
npm run token:test
```

---

## 11. Flujo local

```bash
git pull origin main
npm run setup:project
npm run db:check
npm start
```

No se necesita una instancia local de PostgreSQL para el flujo normal; el backend de desarrollo usa el proyecto Supabase configurado en `server/.env`.

## 12. Cambios de esquema

No editar manualmente producción sin registrar el cambio.

Los cambios futuros deberán agregarse como SQL PostgreSQL en:

```text
database/migrations/
```