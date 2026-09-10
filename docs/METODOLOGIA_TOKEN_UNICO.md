# Metodología de Token Único SAGC

**Código:** MTU-SAGC-V1  
**Versión:** 1.0  
**Formato:** UUID versión 4  
**Norma de referencia:** RFC 9562  
**Estado:** metodología técnica vigente para desarrollo  
**Sistema:** Sistema Automatizado de Gestión de Constancias (SAGC)

---

## 1. Objetivo

Cada constancia emitida por SAGC debe recibir un **Token Único** independiente del folio y de los datos personales de la emisión.

El token se utilizará principalmente para:

- identificar una emisión dentro del validador;
- construir la URL del QR;
- localizar una constancia sin exponer el folio como único parámetro;
- formar parte de la Cadena Original;
- diferenciar de manera inequívoca una emisión, cancelación histórica o reexpedición.

El token no sustituye al folio.

---

## 2. Estándar

SAGC utilizará **UUID versión 4** conforme a RFC 9562.

Un UUID tiene 128 bits. UUIDv4 utiliza datos aleatorios o seudorrandómicos y reserva los bits correspondientes a versión y variante.

Formato textual adoptado por SAGC:

```text
xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
```

donde `y` debe corresponder a la variante RFC:

```text
8
9
a
b
```

Ejemplo válido:

```text
7f0c55ca-3ac5-49a0-8b86-98dd96cef072
```

---

## 3. Formato canónico SAGC

El Token Único siempre se almacenará y mostrará en:

- hexadecimal;
- letras minúsculas;
- cinco grupos;
- guiones en posiciones estándar;
- longitud total de 36 caracteres;
- sin llaves;
- sin prefijo `urn:uuid:`.

Correcto:

```text
7f0c55ca-3ac5-49a0-8b86-98dd96cef072
```

No canónicos:

```text
{7f0c55ca-3ac5-49a0-8b86-98dd96cef072}
URN:UUID:7f0c55ca-3ac5-49a0-8b86-98dd96cef072
7F0C55CA-3AC5-49A0-8B86-98DD96CEF072
```

Los valores recibidos internamente podrán normalizarse a minúsculas antes de validarse.

---

## 4. Expresión de validación

La representación textual debe cumplir:

```regex
^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$
```

Esta expresión verifica:

- estructura UUID;
- versión 4;
- variante compatible;
- representación canónica en minúsculas.

---

## 5. Generación

El token se genera exclusivamente en el backend Node.js.

Implementación normativa:

```js
import { randomUUID } from 'node:crypto';

const token = randomUUID();
```

No se permite:

- generar el token en React;
- escribirlo manualmente;
- derivarlo del folio;
- derivarlo del nombre;
- usar contadores;
- usar fechas;
- concatenar identificadores internos;
- reutilizar tokens anteriores.

---

## 6. Momento de generación

El token se crea durante el proceso de emisión, antes de construir la Cadena Original.

Flujo:

```text
VALIDAR DATOS
    ↓
ASIGNAR FOLIO
    ↓
GENERAR UUIDv4
    ↓
VALIDAR UUIDv4
    ↓
OBTENER EVENTO
    ↓
CONSTRUIR CADENA ORIGINAL
    ↓
PERSISTIR CONSTANCIA
    ↓
GENERAR QR
```

El mismo token debe utilizarse para:

```text
constancias.token_unico
Cadena Original
URL del QR
validador
```

---

## 7. PostgreSQL

La columna oficial será:

```sql
token_unico uuid not null unique
```

No se almacenará como `varchar`.

El tipo nativo `uuid` de PostgreSQL valida la estructura básica y almacena el identificador de manera eficiente.

La restricción `UNIQUE` constituye la última barrera contra una colisión dentro de SAGC.

---

## 8. Colisiones

Una colisión UUIDv4 es extremadamente improbable, pero SAGC no debe depender solo de esa probabilidad.

Regla:

1. generar UUIDv4;
2. intentar insertar la constancia;
3. si PostgreSQL informa conflicto `UNIQUE` sobre `token_unico`, descartar ese UUID;
4. generar otro UUIDv4;
5. repetir como máximo tres intentos;
6. si tres intentos consecutivos fallan, detener la emisión y registrar un error del sistema.

Nunca se modifica manualmente un UUID para resolver una colisión.

---

## 9. Relación con el folio

Folio y token son identificadores independientes.

Ejemplo:

```text
Folio:
2026-A-1380

Token:
7f0c55ca-3ac5-49a0-8b86-98dd96cef072
```

No existe una operación para calcular uno a partir del otro.

---

## 10. Relación con la Cadena Original

El token forma el último bloque de la Cadena Original.

Ejemplo:

```text
2026-A-1380|MARIA-JOSE-MUNOZ-LOPEZ|2026-09-08|CONSTANCIA|XXX-FORO-DE-ESTUDIOS-SOBRE-GUERRERO|7f0c55ca-3ac5-49a0-8b86-98dd96cef072
```

La Cadena Original normaliza el UUID a su representación canónica en minúsculas antes de incorporarlo.

---

## 11. Relación con el QR

El QR utilizará el token como identificador de consulta.

Formato conceptual:

```text
https://dominio/validacion/7f0c55ca-3ac5-49a0-8b86-98dd96cef072
```

El QR no necesita contener la Cadena Original completa.

Al abrirse:

```text
QR
 ↓
token UUIDv4
 ↓
validador SAGC
 ↓
consulta constancias.token_unico
 ↓
resultado de la emisión
```

---

## 12. Exposición del token

El token aparecerá en el QR y podrá formar parte de la URL pública de validación.

Por ello no debe considerarse:

- contraseña;
- credencial de usuario;
- autorización administrativa;
- secreto del sistema.

Conocer un token solo permite localizar la información que el validador público esté autorizado a mostrar.

---

## 13. Inmutabilidad

Después de emitirse una constancia:

```text
token_unico = INMUTABLE
```

No debe existir una función de edición manual del token.

---

## 14. Cancelación

Al cancelar:

```text
token original → se conserva
estado         → CANCELADA
```

El QR original podrá seguir localizando el registro, pero el validador deberá mostrar que la constancia está cancelada.

Nunca se reutiliza ese UUID.

---

## 15. Reexpedición

Una reexpedición constituye una nueva emisión.

Debe recibir:

```text
nuevo folio
nuevo UUIDv4
nueva cadena original
nueva fecha de emisión
```

La constancia nueva se relaciona con la anterior mediante:

```text
id_constancia_origen
```

---

## 16. Datos prohibidos dentro del token

UUIDv4 no codifica información del documento.

No debe contener deliberadamente:

- nombre;
- CURP;
- correo;
- folio;
- año;
- evento;
- tipo documental;
- usuario emisor.

El token únicamente identifica la emisión.

---

## 17. Implementación de referencia

Servicio:

```text
server/src/services/identifiers/token.js
```

Pruebas:

```text
server/src/scripts/check-token.js
```

Ejecutar:

```bash
npm run token:test
```

Las pruebas deben comprobar:

- formato de 36 caracteres;
- versión 4;
- variante RFC;
- minúsculas;
- generación de tokens diferentes;
- rechazo de UUID que no sean versión 4;
- rechazo de texto arbitrario.

---

## 18. Regla normativa resumida

```text
GENERADOR:
Node.js crypto.randomUUID()

FORMATO:
UUIDv4 RFC 9562

CANON:
minúsculas
8-4-4-4-12
sin llaves
sin prefijo

POSTGRESQL:
uuid NOT NULL UNIQUE

CANCELACIÓN:
conservar token

REEXPEDICIÓN:
nuevo token

QR:
usar token

CADENA:
incluir token como último bloque
```
