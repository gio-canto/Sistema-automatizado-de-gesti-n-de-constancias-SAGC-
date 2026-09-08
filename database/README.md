# Base de datos SAGC

La base oficial del proyecto está definida en:

```text
database/Dump20260908.sql
```

Ese archivo es la **fuente de verdad del esquema base**.

El primer modelo creado en Workbench el 08/09/2026 fue corregido directamente y su estructura definitiva quedó integrada en ese mismo archivo. No se mantiene una copia `legacy` ni una migración desde el diseño preliminar.

## Estructura

```text
database/
├── Dump20260908.sql
├── 002_seed_catalogos.sql
├── 003_create_app_user.example.sql
├── 004_smoke_test.sql
├── migrations/
└── README.md
```

## Instalación nueva

En MySQL Workbench o desde consola ejecutar:

```text
Dump20260908.sql
```

El dump crea y deja preparadas:

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

También agrega los tipos documentales iniciales y crea el contador base de folios.

## Qué se corrigió respecto al primer modelo

```text
idUsuarios             → id_usuario
pasword_hash            → password_hash
permisos                → permiso
cuenta_activa           → activo
ideventos               → id_evento
nombre_evento           → nombre
texto                   → textos_evento
campos_personalisados   → campos_evento
idplantillas            → id_plantilla
constancia              → constancias
token                   → token_unico
cadena                  → cadena_validacion
año                     → anio
ultimo_número           → ultimo_valor
```

Los campos `proyecto`, `area` y `modalidad` ya no se modelan como columnas rígidas. Se definen mediante `campos_evento` y sus valores particulares se almacenan en `constancias.datos_variables`.

## Folio Único SAGC V1

La metodología oficial se encuentra en:

```text
docs/METODOLOGIA_FOLIO_UNICO.md
```

Formato:

```text
AAAA-X-XXXX
```

Ejemplos:

```text
2026-A-0001
2026-A-9999
2026-B-0001
2027-A-0001
```

La tabla `contador_folios` mantiene un solo estado por año:

```text
anio
serie
ultimo_valor
```

Cada año inicia en `A / 0`; por eso el primer folio emitido es `AAAA-A-0001`. Al llegar a `9999`, la siguiente emisión avanza a la letra consecutiva y reinicia en `0001`.

La asignación se realiza exclusivamente en backend, dentro de una transacción y bloqueando la fila del año con `SELECT ... FOR UPDATE`.

Implementación:

```text
server/src/services/identifiers/folio.js
```

Prueba:

```bash
npm --prefix server run folio:test
```

---

## Cadena Original y token

El esquema reserva:

```text
token_unico
cadena_validacion
```

La **Cadena Original SAGC** ya está definida en:

```text
docs/METODOLOGIA_CADENA_ORIGINAL.md
```

Formato:

```text
FOLIO|NOMBRE_NORMALIZADO|FECHA|TIPO_DOCUMENTO|NOMBRE_EVENTO_NORMALIZADO|TOKEN_UNICO
```

La columna `cadena_validacion` almacena exactamente esa cadena. El nombre del evento se obtiene de `eventos.nombre` mediante la relación `constancias.id_evento` y se normaliza únicamente para construir la cadena.

La metodología específica para generar `token_unico` continúa como un documento separado pendiente.

## Futuras modificaciones

No se debe editar el dump base por cada cambio posterior una vez iniciada la etapa de migraciones.

Los siguientes cambios estructurales deberán guardarse en:

```text
database/migrations/
```

Ejemplo:

```text
001_folio_unico_v1.sql
002_auth_sessions.sql
003_emisiones_lotes.sql
```