# SAGC — Terminal Administrativa Delimitada

La Terminal Administrativa de SAGC es una consola escrita de administración. Permite introducir comandos manualmente, mantener historial y ejecutar operaciones de consulta y algunas operaciones administrativas controladas.

No es un shell del sistema operativo.

## Objetivo

Permitir una experiencia de consola real sin exponer:

- PowerShell;
- CMD;
- Bash;
- procesos del servidor;
- sistema de archivos;
- SQL arbitrario;
- JavaScript arbitrario;
- variables de entorno;
- secretos de Supabase.

El texto escrito por el administrador se interpreta mediante un lenguaje cerrado de comandos SAGC.

## Controles de la terminal

```text
Enter       ejecutar
Tab         autocompletar
↑ / ↓       historial
Ctrl + L    limpiar pantalla
clear       limpiar pantalla
help        mostrar comandos
```

Se conservan hasta 50 comandos recientes en memoria del navegador durante la sesión de la página.

## Comandos de consulta

```text
help
commands
status
health
whoami
date
uptime

users.count
users.list
users.list --active
users.list --admins
users.list --limit 50
users.show <id|usuario>

events.count
events.list
events.list --state ACTIVO
events.list --limit 50
events.show <id|codigo>

templates.list
templates.list --active
templates.list --limit 50

documents.list
documents.list --state EMITIDA
documents.list --limit 50
documents.show <folio|uuid>

folios.current

audit.latest
audit.latest --limit 50

security.status
sessions.list
```

## Comandos que modifican datos

Estos comandos requieren que el administrador haya activado **Modo elevado** confirmando nuevamente su contraseña.

```text
user.enable <id>
user.disable <id>
user.role <id> ADMIN
user.role <id> NORMAL

event.state <id> BORRADOR
event.state <id> ACTIVO
event.state <id> CERRADO
event.state <id> CANCELADO

security.clear-login-blocks
security.logout-others
```

SAGC impide que un administrador:

- desactive su propia cuenta desde la terminal;
- retire su propio permiso `ADMIN` durante la sesión actual.

Las modificaciones ejecutadas desde terminal se registran en `auditoria`.

## Modo elevado

El modo elevado:

```text
ADMIN autenticado
       ↓
confirmar contraseña
       ↓
Argon2id
       ↓
modo elevado
       ↓
10 minutos
```

Al expirar vuelve automáticamente a modo protegido.

Los comandos de lectura siguen disponibles sin elevar la sesión.

## Gramática delimitada

Se admite:

- un comando por ejecución;
- argumentos separados por espacios;
- cadenas entre comillas simples o dobles;
- opciones como `--limit 50`;
- opciones como `--limit=50`;
- opciones como `--state ACTIVO`.

Ejemplo:

```text
events.list --state ACTIVO --limit 25
```

El backend limita cada entrada a 500 caracteres.

## Operadores rechazados

La terminal rechaza operadores propios de shells o redirecciones:

```text
;
&
|
>
<
`
$
```

También rechaza comandos multilínea.

Por tanto, expresiones como estas no se ejecutan:

```text
status ; rm -rf /
status | cat
SELECT * FROM usuarios
$(comando)
```

Un texto desconocido devuelve un error y recomienda usar `help`.

## Contraseñas

No existen comandos como:

```text
user.create <password>
user.password <password>
```

Esto es deliberado para evitar que una contraseña quede escrita en el historial visual de la terminal.

La creación de usuarios y el restablecimiento de contraseñas se hacen mediante sus formularios protegidos.

## Backend

El intérprete está en:

```text
server/src/services/admin/command-console.js
```

Endpoint:

```http
POST /api/admin/console/command
```

Requiere siempre:

```text
sesión válida
+
permiso ADMIN
```

Los comandos marcados como sensibles requieren además una sesión elevada.

## Frontend

Componente:

```text
src/components/admin/LimitedConsolePanel.jsx
```

Estilos:

```text
src/styles/terminal-console.css
```

La terminal tiene apariencia inspirada en Terminal de macOS, pero las capacidades son exclusivamente las definidas por SAGC.

## Regla para futuras ampliaciones

Para agregar un comando nuevo deben cumplirse estas reglas:

1. declararlo explícitamente en el intérprete;
2. validar todos sus argumentos;
3. no ejecutar texto como código;
4. no concatenar texto del usuario en SQL;
5. usar operaciones parametrizadas/Supabase existentes;
6. exigir modo elevado si modifica seguridad, permisos o datos sensibles;
7. registrar en auditoría cualquier modificación relevante;
8. documentarlo en este archivo.

La consola puede crecer en capacidades, pero nunca debe transformarse en un shell remoto genérico.