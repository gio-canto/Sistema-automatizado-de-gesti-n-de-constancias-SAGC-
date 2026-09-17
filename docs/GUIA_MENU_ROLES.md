# SAGC — Guía del menú por roles

Esta guía documenta la pantalla posterior al inicio de sesión y la separación visual entre usuarios `ADMIN` y `NORMAL`.

## 1. Regla de acceso

SAGC recibe el permiso del usuario autenticado desde:

```text
usuarios.permiso
```

Valores previstos:

```text
ADMIN
NORMAL
```

El usuario de demostración `demo/demo` utiliza la vista administrativa únicamente para poder revisar el prototipo estático.

---

## 2. Usuario ADMIN

Después del login aparece un menú principal con dos áreas:

```text
ADMIN
├── Admin
│   ├── Consola
│   └── Crear usuario
└── SAGC
    ├── Constancia
    ├── Diploma
    ├── Reconocimiento
    ├── Acreditación
    └── Otros / Personalizado
```

### Admin

La tarjeta **Admin** abre el área administrativa.

Por ahora contiene:

- Consola;
- Crear usuario.

La administración completa de usuarios se conectará posteriormente a las operaciones reales del backend.

### SAGC

La tarjeta **SAGC** abre el flujo operativo de registro documental.

---

## 3. Usuario NORMAL

Un usuario `NORMAL` no recibe acceso al área administrativa.

Después del login entra directamente al menú SAGC:

```text
NORMAL
└── SAGC
    ├── Constancia
    ├── Diploma
    ├── Reconocimiento
    ├── Acreditación
    └── Otros / Personalizado
```

No debe mostrarse:

- Admin;
- Consola;
- Crear usuario;
- administración de permisos.

La ocultación en React es solamente la capa visual. Cuando existan endpoints administrativos reales, el backend también deberá validar el permiso `ADMIN` y rechazar accesos no autorizados.

---

## 4. Diseño

La pantalla conserva la estructura del prototipo original:

- cabecera institucional blanca;
- logotipo del Consejo a la izquierda;
- avatar, nombre y permiso a la derecha;
- área de trabajo sobre fondo gris claro;
- tarjetas grandes para cada módulo;
- botones azules de acción;
- sombras suaves y movimiento discreto.

La implementación actual moderniza el prototipo con el sistema visual SAGC sin cambiar su jerarquía funcional.

---

## 5. Componentes

```text
src/components/layout/InstitutionalHeader.jsx
src/components/ui/WorkspaceCard.jsx
src/pages/AccessGrantedPage.jsx
src/styles/workspace.css
```

### InstitutionalHeader

Muestra:

- identidad institucional;
- usuario autenticado;
- permiso;
- fotografía del usuario cuando exista;
- Blobatar como respaldo;
- cierre de sesión.

### WorkspaceCard

Tarjeta reutilizable para módulos.

Props principales:

```text
title
description
actionLabel
icon
onClick
wide
tone
```

---

## 6. Flujo actual

Los botones que todavía no tienen pantalla real muestran una notificación Sileo informando que ese módulo corresponde a la siguiente etapa.

Esto permite probar navegación y jerarquía sin crear formularios falsos o incompletos.

---

## 7. Próximas pantallas

El orden natural después de este menú es:

```text
ADMIN
Consola / Crear usuario

NORMAL o ADMIN → SAGC
Tipo de documento
    ↓
Datos del evento y textos
    ↓
Campos especiales
    ↓
Plantilla
    ↓
Participantes
    ↓
Emisión
```

Las pantallas siguientes deben reutilizar la biblioteca documentada en:

```text
docs/GUIA_HERRAMIENTAS_COMPONENTES_UI.md
```
