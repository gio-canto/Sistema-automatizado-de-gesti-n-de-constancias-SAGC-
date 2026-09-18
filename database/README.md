# Base de datos SAGC — Supabase + PostgreSQL

La tecnología oficial de persistencia de SAGC es:

```text
Supabase
└── PostgreSQL
```

La fuente de verdad del esquema está en:

```text
database/schema.sql
```

## Estructura

```text
database/
├── schema.sql
├── 002_seed_catalogos.sql
├── 004_smoke_test.sql
├── migrations/
│   ├── 001_token_uuid_v4.sql
│   ├── 002_cap_captcha.sql
│   └── README.md
└── README.md
```

## Instalación del esquema

En un proyecto nuevo de Supabase:

1. abrir **SQL Editor**;
2. ejecutar `database/schema.sql`;
3. ejecutar `database/002_seed_catalogos.sql`;
4. ejecutar `database/004_smoke_test.sql`.

El esquema crea:

```text
usuarios
tipos_documento
eventos
textos_evento
campos_evento
plantillas
contador_folios
constancias
auditoria
cap_nonces
cap_tokens
```

También crea estas funciones PostgreSQL:

```text
sagc_healthcheck()
asignar_siguiente_folio(date)
sagc_cap_consume_nonce(text, timestamptz)
sagc_cap_store_token(text, timestamptz)
sagc_cap_consume_token(text)
```

Si la base ya existía antes de Cap, ejecutar únicamente la migración adicional:

```text
database/migrations/002_cap_captcha.sql
```

## Acceso desde el backend

SAGC no conecta React directamente a PostgreSQL.

```text
React/Vite
   ↓ HTTP / JSON
Express API
   ↓ @supabase/supabase-js
Supabase Data API
   ↓
PostgreSQL
```

El backend utiliza:

```dotenv
SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
CAP_SECRET=...
```

Las claves secretas nunca deben aparecer en React, hosting estático ni en el repositorio.

## RLS

Todas las tablas del esquema base tienen **Row Level Security habilitado**.

En esta etapa no se concede acceso directo a `anon` ni `authenticated`. La API Express realiza autorización y utiliza `service_role` desde infraestructura del backend.

Las tablas internas de Cap tampoco son accesibles directamente desde el navegador.

## Folio Único SAGC V1

Formato:

```text
AAAA-X-XXXX
```

El contador se almacena en `contador_folios`. La función:

```text
public.asignar_siguiente_folio(date)
```

reserva el siguiente folio en PostgreSQL y bloquea la fila anual con `FOR UPDATE` para impedir asignaciones concurrentes duplicadas.

## Token Único SAGC V1

Metodología:

```text
docs/METODOLOGIA_TOKEN_UNICO.md
```

Formato:

```text
UUID versión 4
7f0c55ca-3ac5-49a0-8b86-98dd96cef072
```

PostgreSQL utiliza:

```sql
token_unico uuid not null unique
```

El backend genera el UUID con `crypto.randomUUID()`.

## Cadena Original

Formato:

```text
FOLIO|NOMBRE_NORMALIZADO|FECHA|TIPO_DOCUMENTO|NOMBRE_EVENTO_NORMALIZADO|TOKEN_UNICO
```

Se almacena en `constancias.cadena_validacion`.

## Login y Cap

SAGC conserva autenticación propia:

```text
usuarios.password_hash
└── Argon2id
```

Antes de procesar un login real, Express exige un token válido de **Cap Core**.

Cap utiliza PostgreSQL para:

- impedir replay de challenges;
- almacenar temporalmente tokens redimidos;
- consumir cada token una sola vez.

Guía:

```text
docs/GUIA_CAP_SELF_HOSTED.md
```

Supabase Auth continúa fuera del diseño actual.

## Migraciones futuras

Todo cambio posterior al esquema base deberá agregarse en:

```text
database/migrations/
```

y deberá utilizar exclusivamente sintaxis PostgreSQL compatible con Supabase.
