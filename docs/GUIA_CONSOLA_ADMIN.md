# SAGC — Guía de la Consola Administrativa

La consola administrativa evolucionó a una **Consola Administrativa Total**, con sidebar persistente, dashboard, usuarios, eventos, plantillas, documentos, auditoría, sistema, seguridad, configuración y consola limitada.

La guía vigente se encuentra en:

```text
docs/GUIA_CONSOLA_ADMIN_TOTAL.md
```

## Principio central

La consola es completa para administración, pero deliberadamente limitada en ejecución:

- no acepta SQL arbitrario;
- no ejecuta shell;
- no evalúa JavaScript;
- no expone secretos;
- las acciones sensibles requieren reautenticación.

## Desarrollo local

```bash
npm run dev
```

y en otra terminal:

```bash
npm run server:dev
```

Frontend:

```text
http://localhost:5173/
```

Backend:

```text
http://localhost:3001/
```

Para información completa sobre rutas, seguridad, modo elevado, archivos y capacidades actuales consulte `GUIA_CONSOLA_ADMIN_TOTAL.md`.
