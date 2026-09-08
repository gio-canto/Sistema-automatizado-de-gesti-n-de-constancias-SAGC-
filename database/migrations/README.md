# Migraciones futuras de SAGC

Esta carpeta se utilizará **a partir de los cambios posteriores** a la base oficial:

```text
database/Dump20260908.sql
```

No contiene una migración desde el diseño preliminar porque ese diseño ya fue corregido directamente dentro del dump oficial.

Convención recomendada:

```text
001_nombre_del_cambio.sql
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
