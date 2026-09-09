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
│   └── README.md
└── README.md
```

## Instalación del esquema

En un proyecto nuevo de Supabase:

1. abrir **SQL Editor**;
2. crear una consulta nueva;
3. copiar y ejecutar `database/schema.sql`;
4. ejecutar `database/002_seed_catalogos.sql`;
5. ejecutar `database/004_smoke_test.sql`.

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
```

También crea estas funciones PostgreSQL:

```text
sagc_healthcheck()
asignar_siguiente_folio(date)
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
```

La clave secreta nunca debe aparecer en React, GitHub Pages ni en el repositorio.

## RLS

Todas las tablas del esquema base tienen **Row Level Security habilitado**.

En esta etapa no se concede acceso directo a `anon` ni `authenticated`. La API Express realiza la autorización y usa la clave secreta del proyecto para las operaciones administrativas.

Si más adelante se decide conectar una parte del frontend directamente con Supabase, deberán diseñarse políticas RLS específicas antes de conceder permisos.

## Folio Único SAGC V1

Formato:

```text
AAAA-X-XXXX
```

El contador se almacena en:

```text
contador_folios
├── anio
├── serie
├── ultimo_valor
└── fecha_actualizacion
```

La función:

```text
public.asignar_siguiente_folio(date)
```

realiza la reserva del siguiente folio dentro de PostgreSQL y bloquea la fila anual con `FOR UPDATE` para impedir que dos solicitudes reciban el mismo número.

El backend la invoca mediante `supabase.rpc()`.

## Cadena Original

Formato actual:

```text
FOLIO|NOMBRE_NORMALIZADO|FECHA|TIPO_DOCUMENTO|NOMBRE_EVENTO_NORMALIZADO|TOKEN_UNICO
```

Se almacena en:

```text
constancias.cadena_validacion
```

El evento procede de `eventos.nombre`.

## Login

El cambio a Supabase/PostgreSQL no cambia todavía el modelo de autenticación.

SAGC conserva:

```text
usuarios
└── password_hash Argon2id
```

El login ocurre en Express y consulta `usuarios` mediante Supabase.

Supabase Auth podrá evaluarse posteriormente como un cambio separado si el Consejo lo solicita.

## Migraciones futuras

Todo cambio posterior al esquema base deberá agregarse en:

```text
database/migrations/
```

y deberá utilizar exclusivamente sintaxis PostgreSQL.
