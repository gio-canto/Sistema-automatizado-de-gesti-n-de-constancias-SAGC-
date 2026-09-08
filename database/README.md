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

## Folios

El contador se organiza por:

```text
serie + anio + generacion
```

Esto permite folios consecutivos por año/generación sin mezclar secuencias.

La asignación del siguiente folio deberá implementarse mediante transacción en el backend.

## Cadena y token

El esquema ya reserva:

```text
token_unico
cadena_validacion
```

pero su algoritmo definitivo todavía debe documentarse en la metodología de identificadores SAGC.

## Futuras modificaciones

No se debe editar el dump base por cada cambio posterior una vez iniciada la etapa de migraciones.

Los siguientes cambios estructurales deberán guardarse en:

```text
database/migrations/
```

Ejemplo:

```text
001_auth_sessions.sql
002_emisiones_lotes.sql
003_identifier_methodology_v1.sql
```
