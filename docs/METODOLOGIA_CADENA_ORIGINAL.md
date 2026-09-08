# Metodología de Generación de Cadena Original SAGC

**Código:** MCO-SAGC-V2  
**Versión:** 2.0  
**Identificador de versión en cadena:** `SAGC2`  
**Estado:** metodología técnica vigente para desarrollo  
**Sistema:** Sistema Automatizado de Gestión de Constancias (SAGC)

---

## 1. Objetivo

La **Cadena Original SAGC** es la representación textual canónica, determinista e inmutable de los datos esenciales de una emisión.

SAGC2 incorpora expresamente el **evento de emisión**, de modo que una constancia queda vinculada no solo con su titular y folio, sino también con el evento concreto que la originó.

La cadena original no es por sí sola una firma digital. Es la representación estable sobre la cual pueden aplicarse mecanismos posteriores de integridad o autenticidad.

---

## 2. Formato oficial SAGC2

La versión vigente contiene siete bloques y seis separadores `|`:

```text
SAGC2|FOLIO|NOMBRE_NORMALIZADO|FECHA|TIPO_DOCUMENTO|EVENTO_EMISION|TOKEN_UNICO
```

Orden obligatorio:

| Posición | Campo | Fuente |
|---:|---|---|
| 1 | versión | constante `SAGC2` |
| 2 | folio | `constancias.folio` |
| 3 | nombre normalizado | `constancias.nombre_persona` |
| 4 | fecha de emisión | `constancias.fecha_emision` |
| 5 | tipo documental | `tipos_documento.clave` |
| 6 | evento de emisión | `eventos.codigo` |
| 7 | token único | `constancias.token_unico` |

Ejemplo:

```text
SAGC2|2026-A-1380|MARIA-JOSE-MUNOZ-LOPEZ|2026-09-08|CONSTANCIA|EVT-000138|8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10
```

---

## 3. Evento de emisión

El campo `EVENTO_EMISION` identifica de manera estable el evento que originó la constancia.

La fuente normativa es:

```text
eventos.codigo
```

No se utiliza `eventos.id_evento` porque es un identificador interno de base de datos, ni `eventos.nombre` como identificador primario porque el nombre visible puede sufrir correcciones editoriales.

Ejemplo:

```text
id_evento: 138
codigo:    EVT-000138
nombre:    XXX Foro de Estudios sobre Guerrero
```

En la cadena se incorpora:

```text
EVT-000138
```

El backend debe obtener este código desde MySQL a partir de la relación `constancias.id_evento → eventos.id_evento`. No debe confiar en un código de evento enviado libremente por React durante la emisión final.

### Canonicalización

1. eliminar espacios exteriores;
2. Unicode NFKD;
3. eliminar diacríticos;
4. convertir a mayúsculas;
5. espacios convertidos a `-`;
6. permitir únicamente `A-Z`, `0-9`, `.`, `_` y `-`;
7. longitud máxima: 80 caracteres.

---

## 4. Momento de generación

La cadena se crea únicamente cuando ya existen:

1. evento confirmado;
2. titular definitivo;
3. tipo documental definitivo;
4. folio asignado;
5. token asignado;
6. fecha oficial de emisión.

Flujo:

```text
VALIDAR EMISIÓN
    ↓
ASIGNAR FOLIO
    ↓
GENERAR TOKEN
    ↓
OBTENER eventos.codigo DESDE MYSQL
    ↓
FIJAR FECHA DE EMISIÓN
    ↓
CANONICALIZAR
    ↓
CONSTRUIR SAGC2
    ↓
PERSISTIR
    ↓
GENERAR QR / DOCUMENTO
```

La cadena nunca se genera en React.

---

## 5. Campos de entrada SAGC2

```text
folio
nombre_persona
fecha_emision
tipo_documento.clave
eventos.codigo
token_unico
```

El marcador `SAGC2` es constante.

El nombre visible del evento puede mostrarse en el documento o validador, pero la cadena usa el código estable.

---

## 6. Folio

Se utiliza el Folio Único SAGC V1:

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

Metodología relacionada:

```text
docs/METODOLOGIA_FOLIO_UNICO.md
```

---

## 7. Nombre del titular

El nombre mostrado en el documento conserva su ortografía original.

Para la cadena:

1. trim;
2. Unicode NFKD;
3. eliminar diacríticos;
4. mayúsculas;
5. cualquier secuencia no alfanumérica se convierte en `-`;
6. colapsar guiones;
7. eliminar guiones iniciales/finales.

Ejemplo:

```text
María José Muñoz López
↓
MARIA-JOSE-MUNOZ-LOPEZ
```

---

## 8. Fecha de emisión

Formato obligatorio:

```text
YYYY-MM-DD
```

Ejemplo:

```text
2026-09-08
```

La fecha procede del backend y no del formato regional del navegador.

---

## 9. Tipo documental

Se utiliza:

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

Se canonicaliza en mayúsculas, sin diacríticos y con separadores convertidos a `_`.

---

## 10. Token único

El token se incorpora después de ser generado por el subsistema correspondiente.

Para SAGC2:

- es obligatorio;
- no puede editarlo el operador;
- se conserva su mayúscula/minúscula;
- solo se eliminan espacios exteriores accidentales.

La metodología específica del token continúa separada de esta especificación.

---

## 11. Escape de caracteres reservados

Cada campo se escapa después de canonicalizar:

```text
%   → %25
|   → %7C
CR  → %0D
LF  → %0A
```

Así el carácter `|` solo puede actuar como separador estructural.

---

## 12. Algoritmo normativo SAGC2

```text
ENTRADA:
  folio
  nombre_persona
  fecha_emision
  tipo_documento
  evento_emision
  token_unico

version = "SAGC2"

folio_canon   = NORMALIZAR_FOLIO(folio)
nombre_canon  = NORMALIZAR_NOMBRE(nombre_persona)
fecha_canon   = NORMALIZAR_FECHA(fecha_emision)
tipo_canon    = NORMALIZAR_TIPO(tipo_documento)
evento_canon  = NORMALIZAR_EVENTO(evento_emision)
token_canon   = TRIM(token_unico)

VALIDAR:
  año(folio) == año(fecha_emision)
  todos los campos obligatorios presentes

cadena =
  ESCAPAR(version) + "|" +
  ESCAPAR(folio_canon) + "|" +
  ESCAPAR(nombre_canon) + "|" +
  ESCAPAR(fecha_canon) + "|" +
  ESCAPAR(tipo_canon) + "|" +
  ESCAPAR(evento_canon) + "|" +
  ESCAPAR(token_canon)

VALIDAR longitud UTF-8 <= 768 bytes

SALIDA:
  cadena
```

---

## 13. Vector oficial SAGC2

Entrada:

```json
{
  "folio": "2026-A-1380",
  "nombre_persona": "María José Muñoz López",
  "fecha_emision": "2026-09-08",
  "tipo_documento": "CONSTANCIA",
  "evento_emision": "EVT-000138",
  "token_unico": "8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10"
}
```

Salida:

```text
SAGC2|2026-A-1380|MARIA-JOSE-MUNOZ-LOPEZ|2026-09-08|CONSTANCIA|EVT-000138|8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10
```

SHA-256 de control:

```text
3b131822cff5af7789ab91eaf6aef26139c41791260170d4a130736da9c65458
```

El hash no forma parte de la cadena. Es un vector de prueba para verificar implementaciones.

---

## 14. Persistencia

Al emitir se persisten, como mínimo:

```text
id_evento
folio
token_unico
cadena_validacion
fecha_emision
estado
```

La cadena no duplica una nueva columna de evento porque `id_evento` ya relaciona la constancia con `eventos`. El código del evento queda además fijado dentro de la cadena emitida.

Después de emisión son inmutables:

- folio;
- token;
- cadena original;
- evento asociado a esa emisión;
- fecha original.

---

## 15. Cancelación

Cancelar no modifica:

```text
folio
token
cadena
evento
fecha original
```

Solo cambia estado y metadatos de cancelación.

---

## 16. Reexpedición

Una reexpedición es una nueva emisión.

Recibe:

- nuevo folio;
- nuevo token;
- nueva fecha;
- nueva Cadena Original SAGC2;
- evento correspondiente a la nueva emisión;
- `id_constancia_origen`.

---

## 17. QR

El QR no debe contener toda la cadena.

Ruta recomendada:

```text
https://dominio/sagc/validacion/<token>
```

El backend recupera constancia + evento mediante el token.

---

## 18. Integridad criptográfica

SAGC2 puede utilizarse como entrada de:

```text
SHA-256(cadena_original)
HMAC-SHA-256(cadena_original, secreto_servidor)
FIRMA_DIGITAL(cadena_original, clave_privada)
```

El resultado debe almacenarse aparte y no alterar SAGC2.

---

## 19. Versionado

`SAGC1` queda documentado como versión anterior de desarrollo.

El cambio de seis a siete bloques exige `SAGC2` porque se añadió un dato con significado propio: el evento de emisión.

Nunca deben reinterpretarse cadenas SAGC1 como SAGC2.

Si en el futuro se modifican otra vez los campos, el orden o la canonicalización después de congelar SAGC2, deberá crearse una nueva versión.

---

## 20. Implementación de referencia

```text
server/src/services/identifiers/cadena-original.js
```

Prueba:

```bash
npm run chain:test
```

Una implementación compatible debe producir exactamente el vector oficial SAGC2.
