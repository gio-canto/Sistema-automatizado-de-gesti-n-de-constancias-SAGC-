# Migraciones PostgreSQL de SAGC

La base oficial ahora utiliza **Supabase + PostgreSQL**.

El esquema inicial se encuentra en:

```text
database/schema.sql
```

Esta carpeta queda reservada únicamente para cambios posteriores al esquema base.

Convención:

```text
001_token_uuid_v4.sql
002_nombre_del_cambio.sql
003_nombre_del_cambio.sql
```

Todas las migraciones nuevas deben utilizar sintaxis PostgreSQL y poder ejecutarse desde el SQL Editor de Supabase.

Las migraciones vigentes del proyecto deben escribirse exclusivamente para PostgreSQL compatible con Supabase.

Cada migración debe documentar:

- objetivo;
- requisito previo;
- cambios de esquema;
- cambios de datos, si aplica;
- verificación;
- reversión cuando sea viable.