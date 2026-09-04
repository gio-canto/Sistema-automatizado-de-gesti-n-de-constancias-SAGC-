# MySQL + MySQL Workbench para SAGC

Esta guía prepara el entorno local de base de datos del proyecto.

## Arquitectura

```text
React / Vite (:5173)
        |
        | HTTP / JSON
        v
SAGC API Node.js (:3001)
        |
        | mysql2
        v
MySQL Server (:3306)
        ^
        |
MySQL Workbench
```

> React **no debe** conectarse directamente a MySQL. Las credenciales de la base de datos solo viven en el backend.

## 1. Instalar

Instala:

- MySQL Server 8.x.
- MySQL Workbench.
- Node.js 20 o superior.
- Git.

Durante la instalación de MySQL Server conserva la contraseña de la cuenta administradora local.

## 2. Crear conexión en Workbench

1. Abre **MySQL Workbench**.
2. Pulsa **+** junto a *MySQL Connections*.
3. Usa:
   - Connection Name: `SAGC Local`
   - Hostname: `127.0.0.1`
   - Port: `3306`
   - Username: normalmente `root` para preparar el esquema.
4. Pulsa **Test Connection**.
5. Guarda la conexión.

## 3. Crear la base

En Workbench:

1. **File > Open SQL Script**.
2. Abre `database/001_schema.sql`.
3. Ejecuta todo con el icono de rayo.
4. Refresca **SCHEMAS**.

Debe aparecer:

```text
sagc
```

con estas tablas iniciales:

```text
usuarios
tipos_documento
eventos
campos_evento
plantillas
contador_folios
constancias
auditoria
```

## 4. Cargar catálogos iniciales

Abre y ejecuta:

```text
database/002_seed_catalogos.sql
```

Esto agrega los tipos documentales iniciales y prepara el contador de folios.

## 5. Crear usuario de aplicación

No uses `root` desde Node.js.

Abre:

```text
database/003_create_app_user.example.sql
```

Copia las sentencias a una pestaña de Workbench y reemplaza la contraseña de ejemplo por una contraseña local propia.

El usuario de aplicación será:

```text
sagc_app@127.0.0.1
```

y tendrá permisos de lectura/escritura sobre `sagc`, pero no permisos administrativos globales.

## 6. Configurar el backend

Desde la raíz:

### Windows PowerShell

```powershell
Copy-Item server/.env.example server/.env
cd server
npm install
```

### macOS / Linux

```bash
cp server/.env.example server/.env
cd server
npm install
```

Edita:

```text
server/.env
```

y coloca la contraseña que asignaste a `sagc_app`.

Ejemplo:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=sagc
DB_USER=sagc_app
DB_PASSWORD=TU_PASSWORD_LOCAL
```

Nunca subas `server/.env` al repositorio.

## 7. Probar conexión

Dentro de `server/`:

```bash
npm run db:check
```

Debe mostrar:

```text
Conexión MySQL correcta.
```

## 8. Crear primer ADMIN de desarrollo

En `server/.env` cambia:

```dotenv
SAGC_BOOTSTRAP_ADMIN_NAME=Administrador SAGC
SAGC_BOOTSTRAP_ADMIN_USER=admin
SAGC_BOOTSTRAP_ADMIN_PASSWORD=UNA_PASSWORD_LOCAL_DE_12_O_MAS_CARACTERES
```

Después:

```bash
npm run db:bootstrap-admin
```

El script usa **Argon2id** y guarda únicamente el hash en `usuarios.password_hash`.

No vuelve a crear un usuario si ya existe.

## 9. Iniciar API

```bash
npm run dev
```

Prueba en el navegador:

```text
http://localhost:3001/api/health
http://localhost:3001/api/health/db
```

## 10. Iniciar frontend

En otra terminal, desde la raíz:

```bash
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

API:

```text
http://localhost:3001
```

MySQL:

```text
127.0.0.1:3306
```

## 11. Smoke test en Workbench

Ejecuta:

```text
database/004_smoke_test.sql
```

Sirve para comprobar que la base, tablas y catálogos existen.

## 12. Diagrama EER en Workbench

Para visualizar las relaciones:

1. **Database > Reverse Engineer**.
2. Elige la conexión `SAGC Local`.
3. Selecciona el schema `sagc`.
4. Continúa hasta generar el modelo.
5. Abre el **EER Diagram**.

Así podrás ver gráficamente las llaves foráneas.

## 13. Regla para cambios futuros

No modificar producción manualmente desde Workbench.

Los cambios futuros del esquema deberán guardarse en scripts versionados, por ejemplo:

```text
database/
├── 001_schema.sql
├── 002_seed_catalogos.sql
├── 003_create_app_user.example.sql
├── 004_smoke_test.sql
└── migrations/
    ├── 001_add_emisiones.sql
    └── 002_add_template_versioning.sql
```

Workbench se usa para inspección, desarrollo y ejecución controlada de scripts; el historial del esquema debe permanecer en Git.

## Seguridad

- No conectar React directamente a MySQL.
- No usar `root` desde la API.
- No subir `.env`.
- No guardar contraseñas en SQL.
- No abrir el puerto 3306 a Internet.
- En producción, restringir el acceso a MySQL a la red/backend autorizado.