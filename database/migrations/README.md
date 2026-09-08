# Migraciones futuras de SAGC

Esta carpeta se utilizará **a partir de los cambios posteriores** a la base oficial:

```text
database/Dump20260908.sql
```

El primer cambio versionado es:

```text
001_folio_unico_v1.sql
```

Sirve para actualizar una base local creada antes de adoptar el formato oficial `AAAA-X-XXXX`. Se detiene si ya existen constancias emitidas con el formato anterior para evitar modificar folios históricos.

Convención recomendada:

```text
001_folio_unico_v1.sql
002_nombre_del_cambio.sql
003_nombre_del_cambio.sql
```

Ejemplos futuros:

```text
001_auth_sessions.sql
002_emisiones_lotes.sql
003_identifier_methodology_v1.sql
```

Cada migración debe indicar:

- objetivo;
- versión/requisito previo;
- cambios de esquema;
- cambios de datos, si aplica;
- procedimiento de verificación;
- estrategia de reversión cuando sea viable.