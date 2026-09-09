# Metodología de Generación de Cadena Original SAGC

**Código:** MCO-SAGC-V3  
**Versión documental:** 3.0  
**Prefijo dentro de la cadena:** ninguno  
**Estado:** metodología técnica vigente para desarrollo  
**Sistema:** Sistema Automatizado de Gestión de Constancias (SAGC)

---

## 1. Objetivo

La **Cadena Original SAGC** es una representación textual canónica, determinista e inmutable de los datos esenciales de una emisión.

La versión vigente incorpora el **nombre del evento de emisión** tal como está registrado en `eventos.nombre`. La cadena no incluye ningún texto de versión al inicio.

La versión de la metodología se controla en documentación y código, no dentro del valor emitido.

---

## 2. Formato oficial

La cadena contiene seis bloques y cinco separadores `|`:

```text
FOLIO|NOMBRE_NORMALIZADO|FECHA|TIPO_DOCUMENTO|NOMBRE_EVENTO_NORMALIZADO|TOKEN_UNICO
```

Orden obligatorio:

| Posición | Campo | Fuente |
|---:|---|---|
| 1 | folio | `constancias.folio` |
| 2 | nombre normalizado | `constancias.nombre_persona` |
| 3 | fecha de emisión | `constancias.fecha_emision` |
| 4 | tipo documental | `tipos_documento.clave` |
| 5 | nombre del evento | `eventos.nombre` |
| 6 | token único | `constancias.token_unico` |

Ejemplo:

```text
2026-A-1380|MARIA-JOSE-MUNOZ-LOPEZ|2026-09-08|CONSTANCIA|XXX-FORO-DE-ESTUDIOS-SOBRE-GUERRERO|8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10
```

---

## 3. Evento de emisión

La cadena utiliza el **nombre puesto al evento** en SAGC:

```text
eventos.nombre
```

No utiliza:

- `eventos.codigo`;
- `eventos.id_evento`.

Ejemplo de registro:

```text
id_evento: 138
codigo:    EVT-000138
nombre:    XXX Foro de Estudios sobre Guerrero
```

Valor incorporado a la cadena:

```text
XXX-FORO-DE-ESTUDIOS-SOBRE-GUERRERO
```

El backend debe obtener `eventos.nombre` desde Supabase/PostgreSQL a través de `constancias.id_evento` o del evento seleccionado dentro de la transacción de emisión. React no debe poder sustituir libremente ese nombre en el momento final de emitir.

### Canonicalización del nombre del evento

1. eliminar espacios exteriores;
2. Unicode NFKD;
3. eliminar diacríticos;
4. convertir a mayúsculas;
5. convertir cualquier secuencia no alfanumérica en `-`;
6. colapsar guiones consecutivos;
7. eliminar guiones iniciales/finales;
8. máximo 255 caracteres después de canonicalizar.

El nombre almacenado y mostrado al usuario conserva su ortografía original. La transformación solo aplica a la cadena.

---

## 4. Momento de generación

La cadena se genera después de tener definidos:

1. evento de emisión;
2. titular;
3. tipo documental;
4. folio;
5. token único;
6. fecha oficial de emisión.

Flujo:

```text
VALIDAR EMISIÓN
    ↓
ASIGNAR FOLIO
    ↓
GENERAR TOKEN
    ↓
OBTENER eventos.nombre DESDE POSTGRESQL
    ↓
FIJAR FECHA
    ↓
CANONICALIZAR
    ↓
CONSTRUIR CADENA
    ↓
PERSISTIR
    ↓
GENERAR QR / DOCUMENTO
```

La cadena nunca se genera en React.

---

## 5. Datos de entrada

```text
folio
nombre_persona
fecha_emision
tipos_documento.clave
eventos.nombre
token_unico
```

No existe un bloque de versión dentro de la cadena.

---

## 6. Folio

Se utiliza Folio Único SAGC V1:

```text
AAAA-X-XXXX
```

Ejemplo:

```text
2026-A-1380
```

Debe cumplir:

```regex
^[0-9]{4}-[A-Z]-[0-9]{4}$
```

El consecutivo `0000` es inválido y el año debe coincidir con `fecha_emision`.

---

## 7. Nombre del titular

Para la cadena:

```text
María José Muñoz López
↓
MARIA-JOSE-MUNOZ-LOPEZ
```

Reglas:

1. trim;
2. NFKD;
3. eliminar diacríticos;
4. mayúsculas;
5. caracteres no alfanuméricos → `-`;
6. colapsar guiones;
7. eliminar guiones al principio/final.

---

## 8. Fecha

Formato único:

```text
YYYY-MM-DD
```

Ejemplo:

```text
2026-09-08
```

---

## 9. Tipo documental

La fuente es:

```text
tipos_documento.clave
```

Ejemplos:

```text
CONSTANCIA
DIPLOMA
RECONOCIMIENTO
ACREDITACION
PERSONALIZADO
```

---

## 10. Token único

El token:

- es obligatorio;
- se genera en backend;
- no puede editarlo el operador;
- se conserva en su forma original salvo espacios exteriores accidentales.

Su metodología específica se documenta por separado.

---

## 11. Escape de caracteres reservados

Después de canonicalizar:

```text
%   → %25
|   → %7C
CR  → %0D
LF  → %0A
```

---

## 12. Algoritmo normativo

```text
folio_canon   = NORMALIZAR_FOLIO(folio)
nombre_canon  = NORMALIZAR_NOMBRE(nombre_persona)
fecha_canon   = NORMALIZAR_FECHA(fecha_emision)
tipo_canon    = NORMALIZAR_TIPO(tipo_documento)
evento_canon  = NORMALIZAR_NOMBRE_EVENTO(eventos.nombre)
token_canon   = TRIM(token_unico)

VALIDAR año(folio) == año(fecha)

cadena =
  ESCAPAR(folio_canon) + "|" +
  ESCAPAR(nombre_canon) + "|" +
  ESCAPAR(fecha_canon) + "|" +
  ESCAPAR(tipo_canon) + "|" +
  ESCAPAR(evento_canon) + "|" +
  ESCAPAR(token_canon)
```

Longitud máxima: 1024 bytes UTF-8.

---

## 13. Vector oficial de prueba

Entrada:

```json
{
  "folio": "2026-A-1380",
  "nombre_persona": "María José Muñoz López",
  "fecha_emision": "2026-09-08",
  "tipo_documento": "CONSTANCIA",
  "evento_emision": "XXX Foro de Estudios sobre Guerrero",
  "token_unico": "8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10"
}
```

Salida exacta:

```text
2026-A-1380|MARIA-JOSE-MUNOZ-LOPEZ|2026-09-08|CONSTANCIA|XXX-FORO-DE-ESTUDIOS-SOBRE-GUERRERO|8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10
```

El vector de prueba se valida comparando directamente la cadena generada con la salida exacta esperada.

---

## 14. Persistencia e inmutabilidad

Al emitir se persisten:

```text
id_evento
folio
token_unico
cadena_validacion
fecha_emision
estado
```

Después de emitir no deben modificarse:

- folio;
- token;
- cadena;
- evento asociado;
- fecha original.

Aunque posteriormente se edite `eventos.nombre`, la cadena ya emitida no se recalcula. Esto preserva exactamente el nombre del evento que existía al momento de emisión.

---

## 15. Cancelación

La cancelación no modifica folio, token, cadena, evento ni fecha original.

---

## 16. Reexpedición

Una reexpedición recibe:

- nuevo folio;
- nuevo token;
- nueva fecha;
- nueva cadena;
- nombre del evento vigente para esa nueva emisión;
- referencia a `id_constancia_origen`.

---

## 17. QR

El QR no contiene toda la cadena.

Ruta recomendada:

```text
https://dominio/sagc/validacion/<token>
```

---

## 18. Modelo de validación

SAGC no aplicará una capa criptográfica adicional a las constancias.

La validación se realizará consultando el registro persistido en SAGC mediante el token/QR y comprobando:

- existencia del registro;
- folio;
- titular;
- evento;
- fecha;
- tipo documental;
- cadena original;
- estado de la constancia.

Estados relevantes:

```text
EMITIDA
CANCELADA
REEXPEDIDA
```

La cadena se conserva como dato de trazabilidad y comparación dentro del registro SAGC.

---

## 19. Versionado

La cadena emitida **no lleva prefijo de versión**.

El versionado existe únicamente en:

- esta documentación;
- pruebas;
- historial Git;
- código de implementación.

Si el formato cambia antes de producción, se actualiza la metodología documental y sus vectores. Una vez que exista producción con documentos emitidos, cualquier cambio incompatible deberá conservar compatibilidad explícita con las cadenas históricas.

---

## 20. Implementación de referencia

```text
server/src/services/identifiers/cadena-original.js
```

Prueba:

```bash
npm run chain:test
```

Una implementación compatible debe producir exactamente el vector oficial.