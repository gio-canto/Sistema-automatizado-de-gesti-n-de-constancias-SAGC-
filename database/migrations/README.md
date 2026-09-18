# Migraciones PostgreSQL de SAGC

La base oficial utiliza **Supabase + PostgreSQL**.

El esquema inicial se encuentra en:

```text
database/schema.sql
```

Esta carpeta contiene cambios aplicables a una base que ya fue creada con una versión anterior del esquema.

Migraciones actuales:

```text
001_token_uuid_v4.sql
002_cap_captcha.sql
```

## 002_cap_captcha.sql

Añade el almacenamiento de replay protection necesario para **Cap CAPTCHA Core**:

```text
cap_nonces
cap_tokens
```

y las funciones atómicas:

```text
sagc_cap_consume_nonce(text, timestamptz)
sagc_cap_store_token(text, timestamptz)
sagc_cap_consume_token(text)
```

Si la base SAGC ya existía antes de incorporar Cap, ejecutar esta migración **una sola vez** desde Supabase SQL Editor.

En instalaciones nuevas no es necesario ejecutar esta migración por separado porque `database/schema.sql` ya incluye su contenido.

## Convención

```text
001_nombre_del_cambio.sql
002_nombre_del_cambio.sql
003_nombre_del_cambio.sql
```

Todas las migraciones nuevas deben utilizar sintaxis PostgreSQL compatible con Supabase.

Cada migración debe documentar:

- objetivo;
- requisito previo;
- cambios de esquema;
- cambios de datos, si aplica;
- verificación;
- reversión cuando sea viable.
