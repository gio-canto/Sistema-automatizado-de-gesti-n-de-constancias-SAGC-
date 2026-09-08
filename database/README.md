# Base de datos SAGC

Esta carpeta contiene la **fuente de verdad versionada** de la estructura MySQL del proyecto.

## Orden

```text
database/
├── baseline/
│   └── Dump20260908.original.sql
├── migrations/
│   └── 001_from_dump20260908.sql
├── 001_schema.sql
├── 002_seed_catalogos.sql
├── 003_create_app_user.example.sql
└── 004_smoke_test.sql
```

## Qué archivo usar

### Instalación nueva

Ejecutar:

```text
001_schema.sql
002_seed_catalogos.sql
```

### Ya existe la base creada con Dump20260908.sql

No volver a importar el esquema nuevo encima.

Ejecutar:

```text
migrations/001_from_dump20260908.sql
```

La migración transforma la estructura original al esquema canónico y conserva temporalmente las tablas originales con prefijo:

```text
legacy_
```

Ejemplo:

```text
legacy_usuarios
legacy_eventos
legacy_constancia
```

No deben eliminarse hasta comprobar que la migración quedó correcta.

## Relación entre dump y plan

El dump del 08/09/2026 es la **base histórica real** del proyecto.

El archivo `001_schema.sql` es la **forma canónica** que esa base debe adoptar para continuar el desarrollo.

Cambios principales:

| Dump original | Esquema canónico |
|---|---|
| `idUsuarios` | `id_usuario` |
| `pasword_hash` | `password_hash` |
| `permisos` | `permiso` |
| `cuenta_activa` | `activo` |
| `ideventos` | `id_evento` |
| `nombre_evento` | `nombre` |
| `texto` | `textos_evento` |
| `campos_personalisados` | `campos_evento` |
| `idplantillas` | `id_plantilla` |
| `constancia` | `constancias` |
| `token` | `token_unico` |
| `cadena` | `cadena_validacion` |
| `año` | `anio` |
| `ultimo_número` | `ultimo_valor` |

Además se incorporan:

- tipos de documento;
- auditoría;
- estado de constancia;
- reexpedición/cancelación;
- versionado y modo de plantillas;
- relaciones formales;
- índices;
- generación de folios por serie + año + generación.

## Regla desde ahora

No volver a crear dumps en la raíz del repositorio.

Los dumps históricos deben almacenarse en:

```text
database/baseline/
```

Los cambios posteriores al esquema deben ir en:

```text
database/migrations/
```

Ejemplo:

```text
002_add_sessions.sql
003_add_certificate_files.sql
004_identifier_methodology_v1.sql
```

La metodología definitiva de cadena y token único todavía debe diseñarse y aprobarse antes de cerrar ese módulo.
