# SAGC — Guía de herramientas, componentes UI y animaciones

Esta guía documenta las herramientas y componentes visuales adoptados o preparados para SAGC. Su objetivo es que cualquier integrante del equipo pueda saber **qué existe, para qué sirve, cómo se usa y cuándo conviene usarlo**.

> Regla general: el frontend sigue siendo **React + Vite + npm**. No se cambia a Vanilla JS ni a Bun. Cuando una herramienta publique ejemplos con `bun`, en SAGC se usa su equivalente con npm.

---

## 1. Comandos básicos del proyecto

### Desarrollo

```bash
npm run dev
```

Inicia Vite en:

```text
http://localhost:5173/
```

### Compilar

```bash
npm run build
```

### Vista previa del build

```bash
npm run preview
```

### Backend

```bash
npm run server:dev
```

---

# 2. Sileo — notificaciones del sistema

**Estado:** integrado.

Paquete:

```bash
npm i sileo
```

Sileo se usa para mensajes no bloqueantes del sistema:

- guardado correcto;
- error al guardar;
- carga completada;
- advertencias;
- información breve;
- procesos en progreso;
- operaciones basadas en Promise.

Host global:

```text
src/components/system/SileoHost.jsx
```

Helper:

```text
src/lib/notify.js
```

Ejemplo:

```js
import { notify } from '../lib/notify.js';

notify.success('Guardado', 'Los cambios fueron almacenados.');
notify.error('Error', 'No fue posible guardar el registro.');
```

Para una Promise:

```js
notify.promise(guardarEvento(), {
  loading: { title: 'Guardando evento…' },
  success: { title: 'Evento guardado' },
  error: { title: 'No se pudo guardar' },
});
```

No usar Sileo para:

- confirmaciones destructivas que requieren decisión del usuario;
- formularios largos;
- errores de validación específicos de un campo.

En esos casos se usa modal, diálogo o mensaje junto al campo.

---

# 3. Cap — verificación humana autoalojada

**Estado:** integrado en el login real.

SAGC utiliza **Cap Core** dentro de Express y el widget oficial dentro de React.

No se usa una instancia externa de CAPTCHA. El flujo es:

```text
cap-widget
   ↓
/api/cap/login/challenge
/api/cap/login/redeem
   ↓
Express + capjs-core
   ↓
Supabase/PostgreSQL
```

El widget oficial, el WASM y el fallback pako se guardan en `public/vendor/cap/` y se sirven desde el propio SAGC. Vite no necesita resolver paquetes cliente de Cap. El secreto `CAP_SECRET` vive solo en `server/.env`.

Componente:

```text
src/components/CapCaptcha.jsx
```

Backend:

```text
server/src/services/captcha/cap.js
```

Guía completa:

```text
docs/GUIA_CAP_SELF_HOSTED.md
```

Cap sustituye por completo al antiguo `LocalCaptcha` simulado. El token se verifica y consume en backend antes de autenticar al usuario.

---

# 4. React Doctor — revisión de calidad React

**Estado:** preparado como comando; no se ejecuta automáticamente.

React Doctor analiza problemas de React relacionados con arquitectura, rendimiento, accesibilidad, seguridad y mantenibilidad.

### Auditoría manual

```bash
npm run doctor
```

Equivale a:

```bash
npx react-doctor@latest
```

### Revisar cambios recientes

```bash
npm run doctor:changed
```

### Instalar integración para agentes más adelante

```bash
npm run doctor:install
```

Equivale a:

```bash
npx react-doctor@latest install
```

No se ejecuta durante `npm run dev`, para que nunca oculte ni modifique el error original de Vite.

---

# 5. Blobatar — avatares deterministas

**Estado:** dependencia añadida.

Paquetes usados en React:

```bash
npm i blobatar @blobatar/react
```

Aunque la documentación también muestra `bun add`, SAGC usa npm.

Componente SAGC:

```text
UserBlobatar
```

Ubicación:

```text
src/components/ui/ReferenceControls.jsx
```

Ejemplo:

```jsx
import { UserBlobatar } from '../components/ui/index.js';

<UserBlobatar name="usuario@cocytieg.gob.mx" size={42} />
```

Usos previstos:

- perfil de usuario;
- sidebar;
- auditoría;
- listas de operadores;
- avatar de respaldo cuando no existe fotografía.

El mismo texto genera siempre el mismo avatar.

---

# 6. Rare UI — Fluid Orb

**Estado:** preparado para instalación posterior.

Comando SAGC:

```bash
npm run ui:rare:fluid-orb
```

Equivale a:

```bash
npx shadcn@latest add swamimalode07/rare-ui/fluid-orb
```

Uso previsto:

- estados de IA;
- procesamiento visual;
- carga avanzada;
- asistente del sistema;
- estados `idle`, análisis o generación cuando se diseñe ese módulo.

No se instaló todavía en el código activo porque Rare UI se distribuye mediante shadcn y puede introducir configuración adicional de Tailwind/shadcn. Se incorporará cuando el módulo que lo necesita exista, evitando alterar el CSS actual sin necesidad.

Cuando se instale, debe quedar en una ruta similar a:

```text
src/components/ui/fluid-orb.*
```

---

# 7. Sistema visual SAGC basado en las referencias

Los ejemplos visuales compartidos se convierten en componentes reutilizables propios de SAGC. No son imágenes pegadas dentro de la interfaz: se implementan como componentes React adaptables.

Estilos generales:

```text
src/styles/ui-system.css
```

Tokens principales:

```css
--sagc-accent
--sagc-accent-2
--sagc-motion-fast
--sagc-motion
--sagc-motion-slow
--sagc-spring
```

Todas las animaciones deben respetar:

```css
@media (prefers-reduced-motion: reduce)
```

para accesibilidad.

---

## 7.1 ActionButton

Inspirado en los botones premium de acción/eliminación.

```jsx
<ActionButton>Eliminar</ActionButton>
<ActionButton tone="dark">Eliminar</ActionButton>
<ActionButton loading>Procesando</ActionButton>
```

Usar para:

- eliminar registro;
- cancelar constancia;
- acciones importantes;
- operaciones con estado de carga.

Variantes actuales:

```text
danger
dark
```

---

## 7.2 PasswordStrengthField

Inspirado en el campo de contraseña con medidor de fuerza.

Incluye:

- mostrar/ocultar contraseña;
- mínimo de 12 caracteres;
- mayúsculas;
- minúsculas;
- números;
- símbolos;
- barra visual de fortaleza.

Uso previsto:

- creación de usuario;
- cambio de contraseña;
- restablecimiento administrativo.

No sustituye las reglas del backend. El backend debe volver a validar la contraseña.

---

## 7.3 LightSidebar

Inspirado en las referencias de sidebar clara tipo panel administrativo/Storeify-Shopify.

Archivo:

```text
src/components/layout/ReferenceNavigation.jsx
```

Incluye:

- marca;
- buscador;
- navegación;
- elemento activo;
- badges;
- configuración;
- cerrar sesión;
- perfil con Blobatar.

Uso previsto:

- dashboard principal;
- usuarios;
- eventos;
- plantillas;
- emisión;
- auditoría;
- configuración.

En móvil se compacta automáticamente.

---

## 7.4 FileDropzone

Inspirado en el uploader premium de archivos.

Incluye:

- drag & drop;
- selección mediante explorador;
- tipos aceptados;
- límite visual de peso;
- estado cuando un archivo está encima de la zona.

Uso previsto:

- plantillas;
- XLSX de participantes;
- documentos anexos;
- imágenes institucionales.

El componente solo maneja selección visual. La validación real de MIME, peso y seguridad debe ocurrir también en backend.

---

## 7.5 PillNav

Navegación compacta tipo píldora inspirada en las referencias de navegación flotante.

Uso previsto:

- accesos rápidos;
- herramientas de una vista;
- filtros principales;
- navegación secundaria;
- indicadores con badge.

No reemplaza la sidebar para módulos grandes.

---

## 7.6 DateField

Campo de fecha visual con estilo premium.

Utiliza internamente:

```html
<input type="date">
```

por lo que mantiene comportamiento nativo del navegador.

Uso previsto:

- fecha de evento;
- fecha de emisión;
- filtros;
- vigencias.

---

## 7.7 ComposerField

Textarea inspirado en el ejemplo con barra inferior.

Incluye:

- contador de caracteres;
- botón de adjuntar;
- botón de enlace;
- botón de emoji visual.

Uso previsto:

- textos de constancia;
- observaciones;
- mensajes internos;
- notas administrativas.

Los botones solo exponen callbacks; cada módulo decide qué acción ejecutar.

---

## 7.8 SuccessCard

Tarjeta de éxito para finales de procesos importantes.

Uso previsto:

- emisión terminada;
- carga masiva completa;
- usuario creado;
- plantilla guardada;
- operación administrativa concluida.

Para acciones pequeñas debe preferirse Sileo, no una tarjeta completa.

---

## 7.9 ProgressIconButton

Botón circular con progreso visual.

```jsx
<ProgressIconButton progress={72} />
```

Uso previsto:

- generación por lotes;
- subida de archivos;
- empaquetado ZIP;
- procesamiento de documentos.

Cuando llega a `100`, muestra confirmación visual.

---

## 7.10 StickyHeader

Header flotante/sticky inspirado en la referencia premium.

Uso previsto:

- vistas públicas;
- validación;
- páginas donde la sidebar no sea adecuada;
- navegación contextual.

---

# 8. Archivos del sistema UI

```text
src/
├── components/
│   ├── layout/
│   │   └── ReferenceNavigation.jsx
│   ├── system/
│   │   └── SileoHost.jsx
│   └── ui/
│       ├── ReferenceControls.jsx
│       └── index.js
├── lib/
│   └── notify.js
└── styles/
    ├── main.css
    └── ui-system.css
```

---

# 9. Regla para elegir cada componente

| Necesidad | Componente/herramienta |
|---|---|
| Aviso breve | Sileo |
| Éxito de un proceso grande | SuccessCard |
| Acción destructiva | ActionButton |
| Contraseña | PasswordStrengthField |
| Cargar archivo | FileDropzone |
| Navegación principal administrativa | LightSidebar |
| Navegación compacta | PillNav |
| Header flotante | StickyHeader |
| Fecha | DateField |
| Texto largo con herramientas | ComposerField |
| Progreso circular | ProgressIconButton |
| Avatar sin fotografía | Blobatar / UserBlobatar |
| Estado visual de IA futuro | Rare UI Fluid Orb |
| Revisar calidad React | React Doctor |

---

# 10. Instalación después de actualizar el repositorio

Cuando `package.json` cambie por nuevas herramientas, ejecutar manualmente:

```bash
npm install
```

Después, el uso cotidiano continúa siendo:

```bash
npm run dev
```

`npm run dev` **no ejecuta instalaciones automáticas** y no intenta reparar errores. Si Vite falla, la consola debe mostrar el error original.

---

# 11. Criterio de integración futura

Los componentes de esta guía son una **biblioteca preparada**, no significa que deban mostrarse todos desde ahora.

Cada componente se conectará al flujo real únicamente cuando exista la pantalla correspondiente. Esto evita construir interfaces de demostración que después deban desecharse.

Antes de integrar un componente nuevo en una pantalla:

1. comprobar que resuelve una necesidad real;
2. mantener accesibilidad por teclado;
3. respetar `prefers-reduced-motion`;
4. no duplicar otro componente existente;
5. probar responsive;
6. ejecutar `npm run build`;
7. opcionalmente ejecutar `npm run doctor`.
