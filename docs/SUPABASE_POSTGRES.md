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

React no recibe la clave secreta de Supabase ni `CAP_SECRET`.

## 1. Crear el esquema

En un proyecto nuevo:

1. abrir **Supabase SQL Editor**;
2. ejecutar `database/schema.sql`;
3. ejecutar `database/002_seed_catalogos.sql`;
4. ejecutar `database/004_smoke_test.sql`.

Si la base ya existía antes de incorporar Cap, ejecutar además una sola vez:

```text
database/migrations/002_cap_captcha.sql
```

## 2. Configurar server/.env

Crear el archivo desde el ejemplo:

### Windows

```powershell
Copy-Item server/.env.example server/.env
```

### macOS / Linux

```bash
cp server/.env.example server/.env
```

Configurar:

```dotenv
SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=sb_secret_TU_CLAVE_REAL
CAP_SECRET=TU_SECRETO_CAP
```

Para generar `CAP_SECRET`:

```bash
npm run cap:secret
```

Nunca subir `server/.env`.

## 3. Instalar dependencias

Desde la raíz:

```bash
npm install
```

El workspace de npm instala frontend y backend en una sola operación.

## 4. Probar PostgreSQL

```bash
npm run db:check
```

Resultado esperado:

```text
Conexión Supabase/PostgreSQL correcta.
```

También:

```text
http://localhost:3001/api/health/db
```

## 5. Comprobar Cap

Con backend ejecutándose:

```text
http://localhost:3001/api/cap/status
```

Debe indicar que Cap está configurado después de añadir `CAP_SECRET`.

La verificación completa utiliza:

```text
POST /api/cap/login/challenge
POST /api/cap/login/redeem
POST /api/auth/login
```

Guía detallada:

```text
docs/GUIA_CAP_SELF_HOSTED.md
```

## 6. Crear primer administrador

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

La contraseña se transforma con Argon2id antes de guardarse.

## 7. RLS y permisos

El esquema habilita RLS y revoca acceso directo de `anon` y `authenticated`.

Esto incluye las tablas internas de Cap:

```text
cap_nonces
cap_tokens
```

Las operaciones pasan por Express con las credenciales exclusivas del backend.

## 8. Folios

```text
public.asignar_siguiente_folio(date)
```

se invoca con `supabase.rpc()` y PostgreSQL controla el bloqueo del contador.

## 9. Token Único SAGC

El token documental oficial utiliza UUIDv4:

```text
7f0c55ca-3ac5-49a0-8b86-98dd96cef072
```

No confundir este identificador documental con los tokens temporales de Cap CAPTCHA.

## 10. Flujo local

Después de actualizar el repositorio:

```bash
git pull origin main
npm install
npm run db:check
```

Terminal 1:

```bash
npm run dev
```

Terminal 2:

```bash
npm run server:dev
```

No se necesita PostgreSQL local; el backend usa el proyecto Supabase configurado.

## 11. Migraciones

Los cambios posteriores se registran en:

```text
database/migrations/
```

No modificar producción sin guardar la migración correspondiente.
