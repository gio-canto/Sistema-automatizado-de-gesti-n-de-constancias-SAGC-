<div align="center">
  <img src="https://www.fesgro.cocytieg.gob.mx/images/logo_horizontal_w_256.png" alt="Consejo de Ciencia, Tecnología e Innovación del Estado de Guerrero" width="320" />

  # SAGC

  ## Sistema Automatizado de Gestión de Constancias

  **Documento maestro inicial de alcance funcional, visual y técnico**

  <br />

  <a href="https://github.com/gio-canto/Sistema-automatizado-de-gesti-n-de-constancias-SAGC-">
    <img src="https://img.shields.io/badge/GitHub-Repositorio-181717?style=for-the-badge&logo=github" alt="Repositorio" />
  </a>
  <a href="https://gio-canto.github.io/Sistema-automatizado-de-gesti-n-de-constancias-SAGC-/">
    <img src="https://img.shields.io/badge/GitHub_Pages-Prototipo-1877F2?style=for-the-badge&logo=githubpages&logoColor=white" alt="Prototipo" />
  </a>
  <a href="https://github.com/gio-canto/Sistema-automatizado-de-gesti-n-de-constancias-SAGC-/actions">
    <img src="https://img.shields.io/badge/Actions-Despliegues-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="Actions" />
  </a>

  <br /><br />

  ![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=111)
  ![CSS](https://img.shields.io/badge/Estilos-CSS-1572B6?logo=css3&logoColor=fff)
  ![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=fff)
  ![Estado](https://img.shields.io/badge/Estado-Propuesta_en_desarrollo-F59E0B)
  ![Documento](https://img.shields.io/badge/Documento-Requerimientos_iniciales-8A1538)
</div>

---

> [!IMPORTANT]
> Este README no representa todavía una especificación contractual final. Resume lo observado en la propuesta visual, el ejemplo real de constancia entregado como referencia y las decisiones técnicas iniciales del equipo. Todo requisito deberá validarse con el Consejo antes de considerarse definitivo.

> [!WARNING]
> **Mantener el repositorio privado durante el desarrollo interno.** Si el repositorio aparece público, revisar la visibilidad antes de incorporar backend, esquemas definitivos, documentación interna, secretos o datos de prueba sensibles.

---

# 1. Qué se va a construir realmente

SAGC no será solamente un generador de PDF.

El sistema deberá cubrir el ciclo completo de una emisión documental:

1. acceso de personal autorizado;
2. configuración del documento y del evento;
3. definición de textos y campos variables;
4. selección o carga de plantilla;
5. captura manual o carga masiva de personas;
6. revisión de la información;
7. creación automática de folio, cadena, token único y QR;
8. composición del documento;
9. previsualización;
10. descarga;
11. persistencia del registro emitido;
12. validación pública posterior.

El proyecto se divide en dos productos conectados:

<p align="center">
  <img src="./docs/visual/01-arquitectura-general.svg" alt="Arquitectura funcional inicial de SAGC" width="100%" />
</p>

### A. Sistema de gestión

Uso exclusivo de personal autorizado.

Responsable de:

- usuarios;
- eventos;
- tipos de documento;
- textos;
- campos especiales;
- plantillas;
- participantes;
- emisión;
- folios;
- cadena;
- token;
- QR;
- PDF;
- descargas;
- auditoría.

### B. Validador público

Acceso público para comprobar documentos emitidos.

Debe permitir:

- validación directa mediante QR;
- consulta manual;
- mostrar documento válido;
- mostrar documento cancelado, cuando aplique;
- mostrar documento no encontrado o no válido.

---

# 2. Lectura visual de la propuesta

El análisis de las pantallas conceptuales permite identificar un flujo mucho más preciso que el descrito inicialmente solo en texto.

<p align="center">
  <img src="./docs/visual/02-flujo-emision.svg" alt="Flujo visual de emisión SAGC" width="100%" />
</p>

## Flujo funcional esperado

```text
LOGIN
  ↓
TIPO DE DOCUMENTO
  ↓
DATOS DEL EVENTO
  ↓
TEXTOS
  ↓
CAMPOS ESPECIALES
  ↓
TAMAÑO Y ORIENTACIÓN
  ↓
PLANTILLA
  ↓
PREVISUALIZACIÓN
  ↓
CAPTURA MANUAL / CARGA MASIVA
  ↓
REVISIÓN Y CORRECCIÓN
  ↓
GENERACIÓN DE IDENTIFICADORES
  ↓
GENERACIÓN DE DOCUMENTOS
  ↓
PREVISUALIZACIÓN FINAL
  ↓
DESCARGA
  ↓
REGISTRO PERSISTENTE
  ↓
VALIDADOR PÚBLICO
```

---

# 3. Tipos de documento

La propuesta visual contempla como mínimo:

- Constancia
- Diploma
- Reconocimiento
- Acreditación
- Otros / Personalizado

La arquitectura no debe codificar estos tipos como pantallas separadas e irrepetibles.

Se recomienda tratarlos como un catálogo configurable:

```text
tipo_documento
├── id
├── nombre
├── activo
├── plantilla_default
├── reglas
└── campos_base
```

La opción **Otros / Personalizado** deberá permitir crear una emisión que no dependa de uno de los tipos preconfigurados.

---

# 4. Eventos, textos y campos especiales

La propuesta visual muestra una pantalla donde el operador puede definir:

- nombre del evento;
- ID del evento;
- institución emisora;
- encabezados;
- tipo de reconocimiento;
- texto principal;
- lugar;
- fecha;
- autoridad;
- colores por sección;
- campos especiales;
- contenido con Markdown.

## Campos especiales

El concepto de campos especiales es central porque permite que una misma plantilla funcione con distintos datos.

Ejemplos:

```text
{nombre}
{proyecto}
{area}
{modalidad}
{folio}
{fecha}
{evento}
{token}
```

El sistema deberá permitir definir nuevos campos antes de la captura de participantes.

### Regla importante

Los campos especiales creados para una emisión deben propagarse automáticamente a:

- captura manual;
- formato de carga masiva;
- validación de datos;
- composición de la constancia.

---

# 5. Plantillas y diseño

La propuesta visual muestra:

- plantillas básicas;
- plantillas personalizadas;
- descarga de guía;
- carga de archivo;
- previsualización;
- aceptación o rechazo;
- opción de guardar diseño.

## Decisión funcional para SAGC

Las plantillas podrán tener dos comportamientos:

### Plantilla temporal

Se usa únicamente para una emisión y puede eliminarse después de terminar el proceso, de acuerdo con la política que defina el Consejo.

### Plantilla reutilizable

Se guarda en SAGC y queda disponible en futuras emisiones.

Debe contener al menos:

```text
id_plantilla
nombre
tipo_documento
version
orientacion
tamano
archivo
miniatura
activo
creado_por
fecha_creacion
```

> [!IMPORTANT]
> La versión final debe resolver la contradicción del prototipo visual entre “no almacenar” el archivo personalizado y “guardar diseño”. La propuesta técnica actual es permitir ambos modos: temporal o reutilizable.

## Formatos candidatos

- PDF
- PNG
- JPG/JPEG
- TIFF

El backend deberá validar:

- dimensiones;
- orientación;
- peso;
- MIME real;
- resolución;
- áreas de seguridad.

---

# 6. Captura manual y carga masiva

La propuesta visual separa claramente ambos métodos.

## Manual

Pensado para:

- una persona;
- grupos pequeños;
- correcciones;
- altas adicionales.

Debe permitir:

- agregar;
- editar;
- eliminar antes de emitir;
- validar campos obligatorios.

## Masiva

Pensada para eventos con gran cantidad de personas.

Formato principal propuesto:

```text
.xlsx
```

Otros formatos solo deberán habilitarse si existe una necesidad real.

### La carga no genera inmediatamente los documentos

Primero debe existir una pantalla de revisión.

SAGC deberá detectar:

- campos vacíos;
- datos inválidos;
- duplicados;
- columnas desconocidas;
- campos especiales faltantes;
- folios repetidos, si existieran datos heredados;
- errores de tipo.

---

# 7. Folio, cadena, token único y QR

Esta parte debe considerarse **un subsistema propio**.

No se debe implementar con concatenaciones improvisadas dentro del frontend.

## Folio Único SAGC V1

La metodología oficial está definida en:

**[`docs/METODOLOGIA_FOLIO_UNICO.md`](./docs/METODOLOGIA_FOLIO_UNICO.md)**

Formato:

```text
AAAA-X-XXXX
```

Secuencia:

```text
2026-A-0001
...
2026-A-9999
2026-B-0001
...
2026-Z-9999
2027-A-0001
```

Reglas:

- `AAAA` es el año de emisión;
- la serie inicia en `A`;
- el consecutivo inicia en `0001`;
- al llegar a `9999`, la siguiente emisión avanza a la serie consecutiva y reinicia en `0001`;
- al cambiar de año, vuelve a `A-0001`;
- un folio cancelado nunca se reutiliza;
- `Z-9999` agota la capacidad anual;
- la asignación se realiza únicamente en backend mediante transacción y bloqueo de fila.

Capacidad máxima por año:

```text
26 × 9,999 = 259,974 folios
```

Implementación de referencia:

```text
server/src/services/identifiers/folio.js
```

Prueba:

```bash
npm --prefix server run folio:test
```

## Token único

El ejemplo visual incorpora un token individual por constancia.

### Decisión propuesta

El token:

- debe generarse en el servidor;
- debe ser único;
- debe ser impredecible;
- no debe ser ingresado manualmente;
- no debe derivarse solamente del nombre o del folio;
- no debe poder editarse desde la pantalla del operador.

Se recomienda evaluar un identificador generado mediante CSPRNG con suficiente entropía y codificación segura para URL.

## Cadena Original SAGC

La metodología técnica vigente ya está definida en:

**[`docs/METODOLOGIA_CADENA_ORIGINAL.md`](./docs/METODOLOGIA_CADENA_ORIGINAL.md)**

Formato oficial:

```text
FOLIO|NOMBRE_NORMALIZADO|FECHA|TIPO_DOCUMENTO|NOMBRE_EVENTO_NORMALIZADO|TOKEN_UNICO
```

Ejemplo:

```text
2026-A-1380|MARIA-JOSE-MUNOZ-LOPEZ|2026-09-08|CONSTANCIA|XXX-FORO-DE-ESTUDIOS-SOBRE-GUERRERO|8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10
```

La cadena:

- se genera exclusivamente en backend;
- es determinista;
- se almacena en `constancias.cadena_validacion`;
- no puede editarse manualmente;
- permanece inmutable después de emitir;
- no lleva prefijo de versión dentro de la cadena; el versionado se controla en documentación y código.

La cadena original se utilizará como dato de trazabilidad y comparación dentro de SAGC. El proyecto no utilizará SHA-256, HMAC ni firma digital para las constancias.

---

# 8. Metodología de identificadores

## 8.1 Cadena Original SAGC — definida

La especificación normativa se encuentra en:

**[`docs/METODOLOGIA_CADENA_ORIGINAL.md`](./docs/METODOLOGIA_CADENA_ORIGINAL.md)**

La cadena contiene exactamente seis bloques:

```text
FOLIO|NOMBRE_NORMALIZADO|FECHA|TIPO_DOCUMENTO|NOMBRE_EVENTO_NORMALIZADO|TOKEN_UNICO
```

### Datos utilizados

```text
folio
nombre_persona
fecha_emision
tipos_documento.clave
eventos.nombre
token_unico
```

### Reglas principales

- UTF-8;
- orden de campos invariable;
- fecha `YYYY-MM-DD`;
- nombre normalizado sin diacríticos, en mayúsculas y separado por guiones;
- folio validado con formato `AAAA-X-XXXX`;
- tipo documental obtenido de su `clave`;
- evento de emisión obtenido del nombre almacenado en `eventos.nombre`;
- token conservado sin alterar mayúsculas/minúsculas;
- escape de `%`, `|`, CR y LF;
- máximo 1024 bytes;
- generación únicamente server-side;
- persistencia exacta en `cadena_validacion`;
- inmutabilidad después de emisión.

### Vector oficial

Entrada:

```text
2026-A-1380
María José Muñoz López
2026-09-08
CONSTANCIA
XXX Foro de Estudios sobre Guerrero
8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10
```

Salida:

```text
2026-A-1380|MARIA-JOSE-MUNOZ-LOPEZ|2026-09-08|CONSTANCIA|XXX-FORO-DE-ESTUDIOS-SOBRE-GUERRERO|8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10
```

Implementación de referencia:

```text
server/src/services/identifiers/cadena-original.js
```

Prueba ejecutable:

```bash
npm --prefix server run chain:test
```

## 8.2 Token único — pendiente de metodología propia

La cadena vigente ya define **cómo consume** el token, pero todavía debe fijarse formalmente:

- algoritmo de generación;
- número de bits de entropía;
- longitud;
- alfabeto/codificación;
- política ante colisiones;
- exposición pública;
- comportamiento institucional ante reexpedición.

El token debe continuar siendo generado en backend, único, impredecible y no editable.

## 8.3 Validación del registro

SAGC no aplicará SHA-256, HMAC ni firma digital a las constancias.

La validación se apoyará en el registro almacenado en MySQL, el folio, el token/QR, la cadena original y el estado de la emisión.

## 8.4 QR

La recomendación permanece:

```text
https://dominio/sagc/validacion/<token>
```

La cadena completa no debe colocarse en la URL porque contiene el nombre normalizado del titular.

## 8.5 Cancelación y reexpedición

Regla técnica vigente:

- una cancelación no modifica folio, token ni cadena original;
- el estado cambia a `CANCELADA`;
- una reexpedición crea una nueva emisión y una nueva cadena;
- la relación con la emisión anterior se conserva mediante `id_constancia_origen`.

---

# 9. Qué debe producir una constancia SAGC

El segundo PDF de referencia permite definir con mayor precisión el resultado esperado.

La constancia final no es solo una imagen con un nombre.

Debe poder contener:

- identidad institucional;
- tipo de documento;
- nombre;
- motivo;
- proyecto;
- área;
- modalidad;
- evento;
- autoridad;
- QR;
- cadena;
- token;
- folio;
- fecha;
- lugar.

<p align="center">
  <img src="./docs/visual/03-constancia-ejemplo.svg" alt="Ejemplo conceptual de constancia SAGC" width="100%" />
</p>

> [!NOTE]
> La ilustración anterior no pretende reemplazar la plantilla oficial. Su función es documentar qué información tiene que ser capaz de producir el motor de composición.

## Mejora sobre el prototipo visual

En las pantallas conceptuales aparece un campo **Token Único** dentro de la edición individual.

En la implementación final:

```text
folio        → generado por SAGC
token_unico  → generado por SAGC
cadena       → generada por SAGC
qr           → generado por SAGC
```

No deberán ser campos de entrada ordinaria.

---

# 10. Generación del documento

El motor deberá separar:

```text
PLANTILLA
+
DATOS DEL EVENTO
+
DATOS DEL PARTICIPANTE
+
IDENTIFICADORES
+
QR
=
DOCUMENTO FINAL
```

Se recomienda que la generación ocurra en backend o en un servicio controlado.

Debe producir al menos:

- PDF final;
- vista previa;
- miniatura opcional;
- registro de emisión;
- asociación con la constancia en base de datos.

---

# 11. Descarga y cierre

El prototipo contempla:

- descarga individual;
- descarga de todos;
- confirmación antes de terminar.

## Decisión propuesta

Descarga múltiple:

```text
ZIP
```

RAR no se considera necesario salvo requerimiento explícito.

### Terminar no debe borrar la trazabilidad

Cuando el usuario finaliza:

- los PDF temporales pueden limpiarse según política;
- los registros emitidos no deben desaparecer;
- folio, token, cadena, estado y auditoría deben persistir;
- las plantillas reutilizables deben permanecer.

---

# 12. Validador público

## Método principal: QR

El QR abre directamente el registro correspondiente.

## Método alterno

Formulario con:

- nombre;
- folio;
- CAPTCHA cuando sea necesario.

## Documento válido

Puede mostrar:

- tipo;
- titular;
- evento;
- proyecto;
- área;
- modalidad;
- folio;
- autoridad;
- fecha;
- estado.

La exposición pública completa de cadena y token deberá definirse con el Consejo.

## Documento no válido

Debe mostrar un mensaje inequívoco sin revelar información de terceros.

---

# 13. Administración de usuarios

La propuesta contempla dos roles iniciales:

| Rol | Uso |
|---|---|
| NORMAL | Operación ordinaria |
| ADMIN | Administración de usuarios y funciones reservadas |

ADMIN deberá poder:

- crear usuario;
- editar usuario;
- cambiar o restablecer contraseña;
- activar/desactivar;
- asignar rol;
- administrar fotografía;
- consultar auditoría;
- eliminar, si la política lo permite.

> [!CAUTION]
> La imagen conceptual de una “consola” o almacenamiento del navegador no debe trasladarse a producción. La administración real debe operar contra el backend y la base de datos con autorización server-side.

---

# 14. Backend y base de datos

El documento visual propone inicialmente:

```text
usuarios
eventos
plantillas
constancias
contador_folios
```

Para un sistema real se recomienda incorporar además auditoría y versionado donde corresponda.

<p align="center">
  <img src="./docs/visual/04-backend-datos.svg" alt="Modelo de datos inicial de SAGC" width="100%" />
</p>

## usuarios

```text
id_usuario
nombre
usuario
password_hash
permiso
foto
activo
fecha_creacion
```

Hash recomendado a evaluar:

```text
Argon2id
```

## eventos

```text
id_evento
nombre
fecha_inicio
fecha_fin
lugar
responsable
estado
fecha_creacion
```

## plantillas

```text
id_plantilla
nombre
tipo_documento
version
orientacion
tamano
archivo
miniatura
activo
creado_por
fecha_creacion
```

## constancias

```text
id_constancia
id_evento
id_plantilla
tipo_documento
nombre_persona
datos_variables
folio
token_unico
cadena_validacion
qr_destino
fecha_emision
emitido_por
estado
id_constancia_origen
```

## contador_folios

```text
anio
serie
ultimo_valor
fecha_actualizacion
```

Implementa el estado del Folio Único SAGC V1. Debe garantizar concurrencia mediante transacción y bloqueo de fila.

## auditoria

Propuesta adicional necesaria para producción:

```text
id_log
id_usuario
accion
entidad
id_entidad
fecha
ip
metadata
```

---

# 15. Seguridad mínima

Antes de utilizar datos reales:

- backend de autenticación;
- hash de contraseñas;
- sesiones seguras;
- HTTPS;
- control de roles server-side;
- rate limiting;
- validación de archivos;
- CAPTCHA validado en servidor;
- auditoría;
- protección CSRF cuando aplique;
- sanitización de Markdown;
- límites de carga;
- backups;
- política de datos personales.

Nunca subir:

```text
contraseñas reales
API keys
tokens de producción
claves privadas
credenciales de BD
.env con secretos
respaldos con datos personales
```

---

# 16. Estado actual del repositorio

## Actualmente implementado

- React;
- Vite;
- CSS;
- login visual;
- usuario de prueba local;
- carrusel de imágenes;
- logo institucional;
- CAPTCHA de interfaz;
- workflow de GitHub Pages;
- estructura inicial de API Node.js/Express;
- conexión MySQL mediante `mysql2/promise`;
- esquema MySQL v0.1;
- catálogos iniciales;
- usuario de aplicación MySQL documentado;
- script de comprobación de conexión;
- bootstrap de administrador con Argon2id;
- guía completa para MySQL Workbench.

## Aún por desarrollar

- endpoints funcionales completos del backend;
- integración del login React con la API;
- lógica de negocio sobre la base de datos;
- autenticación real;
- administración;
- eventos;
- tipos de documento;
- editor de textos;
- campos especiales;
- plantillas persistentes;
- importación XLSX;
- revisión de datos;
- contador de folios;
- metodología definitiva del token único;
- integración de Cadena Original SAGC en el flujo de emisión;
- generación de QR;
- motor PDF;
- ZIP;
- validador;
- auditoría.

---

# 17. Roadmap técnico

## Fase 0 — Frontend base

- [x] React + Vite
- [x] Login
- [x] Identidad visual
- [x] GitHub Pages
- [x] README de alcance
- [x] Diagramas visuales del proyecto

## Fase 1 — Especificación

- [ ] Validar flujo con el Consejo
- [ ] Definir casos de uso reales
- [ ] Definir permisos
- [ ] Definir tipos documentales
- [ ] Definir formato XLSX
- [ ] Definir política de plantillas
- [x] **Definir metodología de Cadena Original SAGC V2**
- [ ] Definir metodología del token único
- [x] Definir metodología Folio Único SAGC V1
- [ ] Definir qué datos serán públicos

## Fase 2 — Backend y autenticación

- [ ] Tecnología backend
- [ ] Base de datos
- [ ] Migraciones
- [ ] Usuarios
- [ ] Argon2id
- [ ] Login real
- [ ] Sesiones
- [ ] Roles
- [ ] Auditoría inicial

## Fase 3 — Configuración documental

- [ ] Eventos
- [ ] Tipos
- [ ] Textos
- [ ] Campos especiales
- [ ] Markdown seguro
- [ ] Tamaño/orientación

## Fase 4 — Plantillas

- [ ] Plantillas base
- [ ] Personalizadas
- [ ] Temporales/reutilizables
- [ ] Versiones
- [ ] Previsualización

## Fase 5 — Participantes

- [ ] Manual
- [ ] XLSX
- [ ] Validación
- [ ] Correcciones
- [ ] Duplicados

## Fase 6 — Identificadores

- [x] Metodología Folio Único SAGC V1
- [x] Servicio transaccional de referencia del folio
- [ ] Integrar asignación del folio en la transacción completa de emisión
- [ ] Token
- [x] Metodología Cadena Original SAGC
- [x] Implementación de referencia y vector de prueba de cadena
- [ ] Integrar cadena al flujo real de emisión
- [ ] QR
- [ ] Pruebas integrales

## Fase 7 — Generación

- [ ] Motor de composición
- [ ] PDF
- [ ] Preview
- [ ] ZIP
- [ ] Registro persistente

## Fase 8 — Validador

- [ ] URL por token
- [ ] Consulta manual
- [ ] Estado válido
- [ ] Cancelado
- [ ] No válido
- [ ] Protección contra abuso

## Fase 9 — Producción

- [ ] QA
- [ ] Seguridad
- [ ] UAT con Consejo
- [ ] Backups
- [ ] Monitoreo
- [ ] Despliegue institucional

---

# 18. Criterio de aceptación del MVP funcional

El MVP deberá demostrar de extremo a extremo:

1. administrador crea un operador;
2. operador inicia sesión;
3. crea/selecciona evento;
4. selecciona tipo;
5. configura textos y variables;
6. selecciona plantilla;
7. carga participantes;
8. corrige errores;
9. acepta la emisión;
10. backend genera folio;
11. backend genera token;
12. backend genera cadena;
13. backend genera QR;
14. motor genera PDF;
15. usuario previsualiza;
16. descarga;
17. registro permanece en la BD;
18. QR abre validador;
19. documento aparece válido;
20. una consulta incorrecta devuelve no válido;
21. auditoría registra la operación.

---

# 19. Pendientes que deben resolverse con la empresa/Consejo

## Negocio

- [ ] tipos definitivos;
- [ ] responsables de autorización;
- [ ] reglas de cancelación;
- [ ] reglas de reexpedición;
- [ ] datos públicos;
- [ ] vigencia del documento;
- [ ] folio oficial.

## Cadena y token

- [x] metodología técnica de Cadena Original SAGC V2;
- [x] formato oficial de cadena sin prefijo de versión;
- [x] versionado de cadena;
- [x] reglas técnicas de cancelación/reexpedición de cadena;
- [ ] metodología formal del token;
- [ ] formato definitivo de token;
- [ ] URL institucional del QR;
- [ ] aprobación del Consejo sobre la metodología;
- [ ] datos mostrados al público.

## Plantillas

- [ ] formatos finales;
- [ ] tamaños;
- [ ] áreas seguras;
- [ ] almacenamiento;
- [ ] versionado;
- [ ] aprobaciones.

## Datos

- [ ] columnas XLSX;
- [ ] validaciones;
- [ ] duplicados;
- [ ] conservación;
- [ ] privacidad.

## Infraestructura

- [ ] backend;
- [ ] base de datos;
- [ ] almacenamiento;
- [ ] servidor;
- [ ] dominio;
- [ ] HTTPS;
- [ ] backups;
- [ ] producción/pruebas.

---

# 20. Instalación completa y trabajo local

Esta sección explica cómo preparar **todo SAGC desde cero** en una computadora nueva.

El flujo esperado es:

```text
GitHub
  ↓ clone
Repositorio local
  ↓
Frontend React/Vite
  +
Backend Node/Express
  +
MySQL Server
  +
MySQL Workbench
  ↓
Desarrollo local
  ↓
Pruebas
  ↓
Commit
  ↓
Push
  ↓
Pull Request
  ↓
main
```

> [!IMPORTANT]
> El repositorio debe mantenerse **privado durante el desarrollo interno**. No subir contraseñas, archivos `.env`, dumps con datos reales ni credenciales de MySQL.

---

## 20.1 Requisitos e instalación desde consola

SAGC necesita:

- Git;
- Node.js 20 o superior;
- npm;
- MySQL Server 8.x;
- MySQL Workbench;
- un editor como Visual Studio Code.

### Windows 10/11 — PowerShell + winget

Abrir **PowerShell como administrador** y ejecutar:

```powershell
winget install --exact --id Git.Git --accept-package-agreements --accept-source-agreements
winget install --exact --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
winget install --exact --id Oracle.MySQL --accept-package-agreements --accept-source-agreements
winget install --exact --id Oracle.MySQLWorkbench --accept-package-agreements --accept-source-agreements
winget install --exact --id Microsoft.VisualStudioCode --accept-package-agreements --accept-source-agreements
```

Después cerrar y volver a abrir PowerShell para refrescar `PATH`.

El repositorio también incluye un instalador inteligente:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\setup-windows.ps1
```

Antes de instalar cada herramienta, el script comprueba si ya existe:

```text
COMPROBAR
   ↓
¿YA ESTÁ INSTALADA?
   ├── SÍ → OMITIR
   └── NO → INSTALAR → VERIFICAR
```

Por tanto, volver a ejecutar el script no debería reinstalar Git, Node.js, MySQL, Workbench o VS Code si ya están detectados.

> [!NOTE]
> Ese script se usa después de tener una copia del repositorio. Para una computadora completamente nueva, primero instala Git con `winget`, clona el repo y después puedes ejecutar el script.

### macOS — Homebrew

Si Homebrew todavía no está instalado:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Después:

```bash
brew update
brew install git node mysql
brew install --cask mysqlworkbench
brew install --cask visual-studio-code
brew services start mysql
```

### Ubuntu / Debian

```bash
sudo apt update
sudo apt install -y git curl build-essential mysql-server
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo systemctl enable --now mysql
```

Para MySQL Workbench:

```bash
sudo apt install -y mysql-workbench
```

Si la distribución no ofrece ese paquete en sus repositorios, instalar la versión oficial disponible para esa distribución y conservar MySQL Server funcionando localmente.

### Verificar herramientas

```bash
git --version
node --version
npm --version
mysql --version
```

En Windows también puede comprobarse:

```powershell
winget list Git.Git
winget list OpenJS.NodeJS.LTS
winget list Oracle.MySQL
winget list Oracle.MySQLWorkbench
```

El servidor MySQL local deberá quedar disponible normalmente en:

```text
127.0.0.1:3306
```

---

## 20.2 Clonar el repositorio

Desde la carpeta donde se quiera guardar el proyecto:

```bash
git clone https://github.com/gio-canto/Sistema-automatizado-de-gesti-n-de-constancias-SAGC-.git
```

Entrar al proyecto:

```bash
cd Sistema-automatizado-de-gesti-n-de-constancias-SAGC-
```

Comprobar el remoto:

```bash
git remote -v
```

Debe apuntar al repositorio oficial de SAGC.

### Si el repositorio está privado

GitHub puede solicitar autenticación.

Opciones recomendadas:

- iniciar sesión mediante Git Credential Manager;
- usar GitHub Desktop;
- usar una clave SSH configurada;
- usar un Personal Access Token cuando corresponda.

Nunca escribir un token dentro del código o README.

---

## 20.3 Instalar todo el proyecto desde consola

Una vez clonado el repositorio y con Node.js instalado, desde la raíz puede prepararse frontend + backend con un solo comando:

```bash
npm run setup:project
```

Este comando:

1. verifica que Node.js sea 20 o superior;
2. comprueba si `node_modules/` del frontend ya existe;
3. si existe, omite la instalación; si falta, ejecuta `npm install`;
4. comprueba si `server/node_modules/` ya existe;
5. si existe, omite la instalación; si falta, instala el backend;
6. comprueba si `server/.env` ya existe;
7. si existe, lo conserva; si falta, lo crea desde `server/.env.example`.

```text
Frontend instalado?  sí → omitir
                     no → instalar

Backend instalado?   sí → omitir
                     no → instalar

server/.env existe?  sí → conservar
                     no → crear
```

El script utilizado está en:

```text
scripts/bootstrap-dev.mjs
```

### Instalación manual equivalente

Frontend:

```bash
npm install
```

Backend:

```bash
npm run server:install
```

El backend instala actualmente:

- Express;
- mysql2;
- Argon2;
- dotenv;
- cors;
- helmet.

---

## 20.5 Preparar MySQL con Workbench

Abrir **MySQL Workbench**.

Crear una conexión local:

```text
Connection Name: SAGC Local
Hostname: 127.0.0.1
Port: 3306
Username: root
```

Usar la contraseña configurada durante la instalación de MySQL Server.

### Crear la base oficial SAGC

La base oficial ya corregida se encuentra en:

```text
database/Dump20260908.sql
```

Ese archivo **ya contiene la estructura planeada** y sustituye el modelo preliminar que se había generado inicialmente en Workbench.

Para una instalación limpia, ejecutarlo completo:

```text
database/Dump20260908.sql
```

Después puede ejecutarse:

```text
database/004_smoke_test.sql
```

para comprobar tablas, relaciones y contador de folios.

> [!CAUTION]
> El dump oficial reconstruye las tablas del esquema `sagc`. Si existe información que deba conservarse, hacer un respaldo antes de ejecutarlo.

Esto prepara:

```text
sagc
├── usuarios
├── tipos_documento
├── eventos
├── campos_evento
├── plantillas
├── contador_folios
├── constancias
└── auditoria
```

Guía ampliada:

**[`docs/MYSQL_WORKBENCH.md`](./docs/MYSQL_WORKBENCH.md)**

### Crear la base también desde consola

Si el comando `mysql` está disponible en `PATH`, no es obligatorio abrir Workbench para inicializar la base.

Desde la raíz del repositorio:

```bash
mysql -u root -p -e "SOURCE database/Dump20260908.sql;"
mysql -u root -p -e "SOURCE database/004_smoke_test.sql;"
```

MySQL solicitará la contraseña de `root`.

Comprobar:

```bash
mysql -u root -p -e "USE sagc; SHOW TABLES;"
```

Workbench puede seguir utilizándose para:

- inspeccionar tablas;
- ejecutar consultas;
- visualizar relaciones;
- generar el diagrama EER;
- revisar datos durante desarrollo.

---

## 20.6 Crear el usuario MySQL de SAGC

No se debe conectar la API usando `root`.

Abrir:

```text
database/003_create_app_user.example.sql
```

Copiar sus sentencias a una nueva pestaña de Workbench y cambiar:

```text
CAMBIAR_CONTRASENA_LOCAL
```

por una contraseña local segura.

El usuario esperado será:

```text
sagc_app@127.0.0.1
```

---

## 20.7 Crear el archivo de configuración local

El repositorio incluye:

```text
server/.env.example
```

Hay que crear una copia llamada:

```text
server/.env
```

### Windows PowerShell

```powershell
Copy-Item server/.env.example server/.env
```

### macOS / Linux

```bash
cp server/.env.example server/.env
```

Editar después:

```dotenv
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=sagc
DB_USER=sagc_app
DB_PASSWORD=TU_CONTRASENA_LOCAL
DB_CONNECTION_LIMIT=10
```

> [!CAUTION]
> `server/.env` está ignorado por Git. Nunca debe subirse.

---

## 20.8 Probar MySQL antes de arrancar SAGC

Desde la raíz:

```bash
npm run db:check
```

La salida correcta debe indicar:

```text
Conexión MySQL correcta.
```

También puede probarse desde Workbench ejecutando:

```text
database/004_smoke_test.sql
```

---

## 20.9 Crear el primer administrador de desarrollo

Configurar temporalmente en:

```text
server/.env
```

estas variables:

```dotenv
SAGC_BOOTSTRAP_ADMIN_NAME=Administrador SAGC
SAGC_BOOTSTRAP_ADMIN_USER=admin
SAGC_BOOTSTRAP_ADMIN_PASSWORD=UNA_CONTRASENA_LOCAL_DE_12_O_MAS_CARACTERES
```

Después:

```bash
npm run db:bootstrap-admin
```

El backend guardará únicamente un hash **Argon2id** en MySQL.

---

## 20.10 Lanzar SAGC completo con un solo comando

La forma recomendada de iniciar el proyecto local es:

```bash
npm start
```

También puede utilizarse:

```bash
npm run start:local
```

El lanzador:

1. comprueba que existan las dependencias del frontend y backend;
2. inicia Express;
3. inicia Vite en `127.0.0.1:5173`;
4. fuerza el puerto 5173 para evitar cambios silenciosos a 5174/5175;
5. espera hasta 30 segundos a que Vite responda realmente;
6. solo cuando la página está lista abre el navegador;
7. comprueba el endpoint de salud del backend;
8. si MySQL/backend falla, permite que el frontend siga disponible para `demo / demo`.

```text
npm start
   ↓
Backend :3001
   +
Vite :5173
   ↓
esperar respuesta HTTP real
   ↓
abrir navegador
```

Si faltan dependencias, ejecutar primero:

```bash
npm run setup:project
```

### Arranque manual del backend

```bash
npm run server:dev
```

Backend:

```text
http://127.0.0.1:3001
```

Pruebas rápidas:

```text
http://127.0.0.1:3001/api/health
http://127.0.0.1:3001/api/health/db
```

---

## 20.11 Arranque manual del frontend

Si se desea ejecutar solamente Vite:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

En desarrollo Vite redirige automáticamente:

```text
/api
   ↓
http://localhost:3001
```

Por eso React no necesita conocer directamente las credenciales de MySQL.

---

## 20.12 Accesos durante desarrollo

El frontend conserva temporalmente:

```text
Usuario: demo
Contraseña: demo
```

para la demostración estática.

Cuando backend + MySQL están activos, también puede utilizarse un usuario real creado en la tabla:

```text
usuarios
```

por ejemplo el administrador creado con:

```bash
npm run db:bootstrap-admin
```

---

## 20.13 Cómo trabajar cada día

Antes de empezar:

```bash
git checkout main
git pull origin main
```

Después crear una rama para la tarea:

```bash
git checkout -b feature/nombre-de-la-funcion
```

Ejemplos:

```bash
git checkout -b feature/admin-users
git checkout -b feature/events
git checkout -b feature/templates
git checkout -b feature/mass-import
git checkout -b feature/public-validator
```

Evitar desarrollar funcionalidades grandes directamente sobre `main`.

---

## 20.14 Ver qué se modificó

Durante el trabajo:

```bash
git status
```

Para revisar diferencias:

```bash
git diff
```

Para revisar archivos ya preparados:

```bash
git diff --staged
```

---

## 20.15 Probar antes de subir

Frontend:

```bash
npm run build
```

Backend/MySQL:

```bash
npm run db:check
```

Si se modificó el backend:

```bash
npm run server:dev
```

y verificar manualmente los endpoints afectados.

No subir una rama que rompa:

- compilación;
- login;
- conexión de desarrollo;
- esquema SQL;
- GitHub Pages.

---

## 20.16 Guardar cambios localmente con Git

Agregar cambios:

```bash
git add .
```

Crear commit:

```bash
git commit -m "Descripción breve del cambio"
```

Ejemplos:

```bash
git commit -m "Add event management API"
git commit -m "Fix certificate template preview"
git commit -m "Add user administration screen"
```

---

## 20.17 Subir una rama a GitHub

La primera vez:

```bash
git push -u origin feature/nombre-de-la-funcion
```

Después:

```bash
git push
```

Esto **sube el trabajo local a GitHub**, pero todavía no lo integra a `main`.

---

## 20.18 Crear Pull Request

En GitHub:

```text
Repositorio
→ Pull requests
→ New pull request
→ base: main
→ compare: feature/nombre-de-la-funcion
```

Antes de fusionar revisar:

- cambios de código;
- SQL;
- archivos accidentales;
- secretos;
- `.env`;
- funcionamiento del frontend;
- funcionamiento del backend;
- build;
- documentación.

---

## 20.19 Actualizar una rama con los cambios más recientes

Si `main` cambió mientras se trabaja:

```bash
git checkout main
git pull origin main
git checkout feature/nombre-de-la-funcion
git merge main
```

Resolver conflictos si aparecen y volver a probar.

---

## 20.20 Después de fusionar una rama

Volver a `main`:

```bash
git checkout main
git pull origin main
```

Eliminar rama local si ya no se necesita:

```bash
git branch -d feature/nombre-de-la-funcion
```