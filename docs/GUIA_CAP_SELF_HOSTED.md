# SAGC — Cap CAPTCHA autoalojado

SAGC reemplaza el antiguo CAPTCHA local de demostración por **Cap**, usando **Cap Core** dentro de la API Express y los recursos oficiales del widget servidos desde el propio proyecto.

Arquitectura:

```text
React / Vite
    ↓
public/vendor/cap/cap.min.js
    ↓
/api/cap/login/
    ↓
Express + capjs-core
    ↓
Supabase / PostgreSQL
```

No existe una instancia externa de CAPTCHA, Docker separado, Redis externo ni CDN necesario durante la ejecución.

## 1. Componentes

Frontend:

```text
src/components/CapCaptcha.jsx
```

Recursos oficiales vendorizados:

```text
public/vendor/cap/
├── cap.min.js
├── cap_wasm_bg.wasm
├── pako_inflate.min.js
└── LICENSE
```

Versiones vendorizadas:

```text
Cap widget 0.1.57
Cap WASM   0.0.7
pako       2.1.0
```

Backend:

```text
server/src/services/captcha/cap.js
capjs-core 0.1.1
```

Migración para bases ya creadas:

```text
database/migrations/002_cap_captcha.sql
```

## 2. Por qué los assets del widget están dentro del repositorio

Cap permite instalar el widget mediante npm, pero SAGC necesita que todos sus recursos de ejecución salgan del propio proyecto.

Por eso el navegador **no importa**:

```text
cap-widget
@cap.js/wasm
pako
```

desde `node_modules`.

`CapCaptcha.jsx` carga el widget oficial desde:

```text
/vendor/cap/cap.min.js
```

y antes de cargarlo configura:

```js
window.CAP_CUSTOM_WASM_URL = '/vendor/cap/cap_wasm_bg.wasm';
window.CAP_PAKO_URL = '/vendor/cap/pako_inflate.min.js';
```

En GitHub Pages las rutas usan automáticamente `import.meta.env.BASE_URL`, por lo que respetan el subdirectorio del repositorio.

Esto elimina dependencias de CDN y también evita que Vite tenga que resolver el widget o el WASM como imports npm.

## 3. Endpoint local

El widget usa:

```text
/api/cap/login/
```

y llama a:

```http
POST /api/cap/login/challenge
POST /api/cap/login/redeem
```

También existe:

```http
GET /api/cap/status
```

La autenticación continúa en:

```http
POST /api/auth/login
```

pero exige un `capToken` válido.

## 4. Flujo

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
se guarda token temporal
        ↓
login envía usuario + contraseña + capToken
        ↓
PostgreSQL consume el token
        ↓
Argon2id valida contraseña
        ↓
sesión SAGC
```

El token de Cap es de un solo uso.

## 5. Replay protection

SAGC reutiliza PostgreSQL:

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

No se utiliza Redis.

## 6. Preparar una base existente

Si Supabase ya existía antes de Cap, ejecutar una sola vez:

```text
database/migrations/002_cap_captcha.sql
```

En una instalación nueva, `database/schema.sql` ya contiene esas estructuras.

## 7. Secreto Cap

Generar:

```bash
npm run cap:secret
```

Copiar la salida a:

```text
server/.env
```

como:

```dotenv
CAP_SECRET=...
```

Nunca colocarla en React, `VITE_*`, GitHub Pages o el repositorio.

## 8. Dependencia backend

El único paquete Cap que SAGC necesita instalar mediante npm en tiempo de desarrollo es:

```text
capjs-core 0.1.1
```

Está en `server/package.json`.

Por tanto, después de obtener una versión del repositorio que incorpora Cap, ejecutar una vez:

```bash
npm install
```

Esto instala el backend del workspace. El frontend ya recibe el widget/WASM desde `public/vendor/cap/`.

## 9. Desarrollo local

Terminal 1:

```bash
npm run dev
```

Terminal 2:

```bash
npm run server:dev
```

Vite redirige `/api` a:

```text
http://localhost:3001
```

## 10. Instrumentation

El challenge se genera con:

```text
instrumentation: true
scope: sagc-login
```

El widget 0.1.57 y Cap Core 0.1.1 son compatibles con esta modalidad.

## 11. Verificación del servidor

El widget visual no concede acceso.

`POST /api/auth/login` falla si el token:

- falta;
- tiene formato inválido;
- expiró;
- no está almacenado;
- ya fue consumido.

La comprobación ocurre antes de consultar credenciales y antes de Argon2id.

El limitador de intentos del login continúa funcionando como segunda capa.

## 12. Restablecimiento

Después de un intento de login fallido, React llama `reset()` y obliga a resolver un challenge nuevo.

## 13. Datos secretos

Nunca llegan al navegador:

```text
CAP_SECRET
SUPABASE_SECRET_KEY
password_hash
```

## 14. Atribución oficial

El archivo `cap.min.js` es el widget oficial de Cap y conserva su comportamiento y atribución. Su licencia Apache-2.0 está incluida en:

```text
public/vendor/cap/LICENSE
```

## 15. GitHub Pages

GitHub Pages puede servir los recursos estáticos vendorizados de Cap, pero **no puede ejecutar Express**.

Por tanto, el widget solo podrá completar challenge/redeem en producción cuando la API SAGC esté desplegada detrás de `/api`.

## 16. Diagnóstico

Prueba del backend:

```bash
npm run cap:test
```

Estado:

```text
http://localhost:3001/api/cap/status
```

Archivos que deben responder desde Vite:

```text
http://localhost:5173/vendor/cap/cap.min.js
http://localhost:5173/vendor/cap/cap_wasm_bg.wasm
http://localhost:5173/vendor/cap/pako_inflate.min.js
```

Si alguno devuelve 404, el problema es de assets. Si esos tres responden y el widget falla al resolver, revisar la API `/api/cap/login/`.

## 17. Pruebas de aceptación

1. el widget aparece;
2. el widget llega a **Verificado**;
3. login válido funciona;
4. login sin `capToken` falla;
5. token inventado falla;
6. el mismo token no funciona dos veces;
7. contraseña incorrecta consume el token y obliga a resolver otro challenge;
8. Network no muestra descargas de CDN para widget, WASM o pako.
