# Recordatorios de seguridad

## Antes de staging o producción

- Regenerar la credencial privada de Cap usada durante el prototipo.
- Actualizar `server/.env` con la nueva credencial.
- No reutilizar la credencial temporal del entorno local.
- No subir credenciales reales al repositorio.
- Reiniciar el backend y ejecutar `npm run cap:check` después de la rotación.
