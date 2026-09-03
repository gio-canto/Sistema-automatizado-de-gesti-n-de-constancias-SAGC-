# SAGC Login Starter

Primera réplica funcional del acceso para SAGC usando los requisitos mínimos indicados: React + CSS.

## Ejecutar

```bash
npm install
npm run dev
```

## Alcance actual

- React + CSS puro.
- Responsive escritorio/móvil.
- Usuario y contraseña.
- Mostrar/ocultar contraseña.
- Estados de carga y error.
- Sin registro público: las cuentas se crean por ADMIN.
- Preparado para conectar `POST /api/auth/login`.

## Mínimos para producción

- HTTPS.
- Contraseñas hasheadas en servidor (Argon2id o bcrypt).
- Cookie de sesión `HttpOnly`, `Secure`, `SameSite`.
- Validación de rol en backend, no solo en React.
- Rate limiting en login.
- Mensajes de error genéricos para no revelar usuarios existentes.
- Cierre de sesión e invalidación de sesión.

## Máximos recomendables para SAGC

- Bloqueo temporal/progresivo tras intentos fallidos.
- CAPTCHA únicamente después de varios fallos, no siempre.
- Registro de auditoría de accesos administrativos.
- Expiración e inactividad de sesión.
- Restablecimiento de contraseña controlado por ADMIN.
- 2FA opcional para cuentas ADMIN.
- Indicador de conexión con el servidor SAGC.

## Nota visual

El sitio FESGRO público es una app renderizada del lado del cliente y su HTML accesible públicamente no expone el detalle de su composición visual al rastreador usado para esta revisión. Por eso esta versión reproduce el patrón institucional de acceso y queda preparada para ajustar tipografías, logos, proporciones y colores cuando se disponga de una captura exacta.
