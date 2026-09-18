# SAGC — Cap CAPTCHA autoalojado

SAGC reemplaza el antiguo CAPTCHA local de demostración por **Cap**, utilizando **Cap Core** dentro de la API Express.

La elección de Cap Core mantiene toda la verificación dentro de la arquitectura que SAGC ya posee:

```text
React / Vite
    ↓
cap-widget
    ↓ mismo origen
/api/cap/login/
    ↓
Express + capjs-core
    ↓
Supabase / PostgreSQL
```

No existe una instancia externa de CAPTCHA, Docker separado, Redis externo ni servicio de terceros para generar o validar retos.

## 1. Componentes

Frontend:

```text
src/components/CapCaptcha.jsx
```

Backend:

```text
server/src/services/captcha/cap.js
```

Migración para bases ya creadas:

```text
database/migrations/002_cap_captcha.sql
```

El esquema de una instalación nueva ya contiene esas tablas y funciones en:

```text
database/schema.sql
```

## 2. Dependencias

Frontend:

```text
cap-widget 0.1.56
@cap.js/wasm 0.0.7
pako 2.1.0
```

Backend:

```text
capjs-core 0.1.1
```

Las versiones están fijadas para evitar que una actualización de Cap cambie el comportamiento sin revisión.

## 3. Recursos locales

SAGC no carga el widget desde un CDN.

Vite empaqueta:

- el widget;
- el WASM de Cap;
- el fallback de descompresión pako.

Antes de cargar el widget se configuran:

```js
window.CAP_CUSTOM_WASM_URL = wasmUrl;
window.CAP_PAKO_URL = pakoUrl;
```

El endpoint del widget también es del propio SAGC:

```text
/api/cap/login/
```

La página de ayuda del widget es local:

```text
public/cap-troubleshooting.html
```

El widget oficial conserva la atribución **Cap** incluida por el proyecto.

## 4. Endpoints

Cap Core utiliza dos rutas:

```http
POST /api/cap/login/challenge
POST /api/cap/login/redeem
```

También existe un diagnóstico no sensible:

```http
GET /api/cap/status
```

La autenticación real continúa en:

```http
POST /api/auth/login
```

pero ahora requiere un `capToken` válido y de un solo uso.

## 5. Flujo

```text
usuario pulsa el widget
        ↓
POST challenge
        ↓
Express genera reto Cap
        ↓
navegador resuelve proof-of-work + instrumentation
        ↓
POST redeem
        ↓
Express valida
        ↓
PostgreSQL consume nonce de manera atómica
        ↓
se almacena token de acceso temporal
        ↓
Login envía usuario + contraseña + capToken
        ↓
PostgreSQL elimina el capToken al consumirlo
        ↓
Argon2id valida la contraseña
        ↓
sesión SAGC
```

El token de Cap es **single-use**. Un segundo intento con el mismo token falla.

## 6. Replay protection

Cap Core requiere almacenamiento para impedir reutilización de retos y tokens.

SAGC reutiliza PostgreSQL, por lo que no añade Redis.

Tablas:

```text
cap_nonces
cap_tokens
```

Funciones:

```text
sagc_cap_consume_nonce(text, timestamptz)
sagc_cap_store_token(text, timestamptz)
sagc_cap_consume_token(text)
```

La operación de consumo se realiza dentro de PostgreSQL y no mediante una secuencia de lectura y borrado en JavaScript.

## 7. Preparar una base existente

Si el proyecto Supabase ya fue creado antes de esta integración, ejecutar una sola vez en **Supabase SQL Editor**:

```text
database/migrations/002_cap_captcha.sql
```

No ejecutar esta migración repetidamente como parte del inicio del servidor.

Para una base completamente nueva basta con ejecutar el `database/schema.sql` actualizado.

## 8. Secreto de Cap

Generar localmente:

```bash
npm run cap:secret
```

El comando imprime una línea similar a:

```dotenv
CAP_SECRET=...
```

Copiarla a:

```text
server/.env
```

No pegar el secreto en React, variables `VITE_*`, GitHub Pages ni archivos versionados.

## 9. Configuración local

Después de actualizar el repositorio:

```bash
npm install
```

Terminal de frontend:

```bash
npm run dev
```

Terminal del backend:

```bash
npm run server:dev
```

El widget usa el proxy de Vite hacia:

```text
http://localhost:3001
```

por lo que desde React continúa siendo una ruta same-origin `/api/...`.

## 10. Instrumentation

El reto del login se genera con:

```text
instrumentation: true
```

El scope utilizado por challenge y redeem es exactamente:

```text
sagc-login
```

Cambiarlo solo en una de las dos operaciones invalida todos los retos.

## 11. Verificación del servidor

El widget por sí solo no concede acceso.

`POST /api/auth/login` falla cuando:

- falta el token;
- el token no existe;
- el token expiró;
- ya fue consumido;
- la verificación Cap no pudo almacenarse correctamente.

La verificación ocurre antes de consultar la cuenta y antes de Argon2id.

El rate limiting del login continúa funcionando como segunda capa.

## 12. Restablecimiento

Cuando un login falla después de consumir el token, React ejecuta `reset()` sobre el widget. El usuario debe resolver un nuevo reto antes de volver a intentar, porque los tokens de Cap no se reutilizan.

## 13. Datos que nunca salen al frontend

Nunca se entrega al navegador:

```text
CAP_SECRET
SUPABASE_SECRET_KEY
password_hash
```

El navegador recibe únicamente el reto y el token temporal que necesita para completar la verificación.

## 14. GitHub Pages

GitHub Pages solo publica el frontend estático. No ejecuta Express.

Por tanto, el widget Cap real requiere que el backend SAGC esté disponible. El build de Pages puede compilar el componente, pero el CAPTCHA no puede generar retos si no existe una API desplegada detrás de `/api`.

## 15. Pruebas de aceptación

Con una instancia local ya configurada deben probarse estos casos:

1. el widget resuelve y muestra **Verificado**;
2. login correcto con token válido;
3. POST directo a `/api/auth/login` sin `capToken` devuelve error;
4. token inventado devuelve error;
5. un token válido usado una segunda vez devuelve error;
6. contraseña incorrecta consume el token y obliga a resolver otro;
7. reiniciar React no expone ningún secreto de Cap.

El workflow de GitHub valida instalación, sintaxis del backend y compilación Vite. Las pruebas de challenge/redeem necesitan el `CAP_SECRET` y la base Supabase de desarrollo, por lo que se realizan en el entorno local o de staging.
