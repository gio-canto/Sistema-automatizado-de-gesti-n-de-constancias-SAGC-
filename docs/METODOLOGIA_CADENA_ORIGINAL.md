# Metodología de Generación de Cadena Original SAGC

**Código:** MCO-SAGC-V1  
**Versión:** 1.0  
**Identificador de versión en cadena:** `SAGC1`  
**Estado:** metodología técnica definida para desarrollo  
**Sistema:** Sistema Automatizado de Gestión de Constancias (SAGC)

---

## 1. Objetivo

La **Cadena Original SAGC** es una representación textual canónica, determinista e inmutable de los datos esenciales de una constancia emitida.

Su propósito es:

- vincular de forma reproducible una emisión con su folio, titular, fecha, tipo documental y token;
- evitar que distintas partes del sistema construyan cadenas diferentes para los mismos datos;
- permitir comparación exacta entre el documento emitido y el registro persistido;
- proporcionar una entrada estable para mecanismos posteriores de hash, HMAC o firma digital;
- mantener compatibilidad conceptual con el formato mostrado en las constancias de referencia del proyecto.

La cadena original **no es por sí sola una firma digital ni una prueba criptográfica de autenticidad**.

---

## 2. Formato oficial V1

La Cadena Original SAGC V1 contiene exactamente seis bloques y cinco separadores `|`:

```text
SAGC1|FOLIO|NOMBRE_NORMALIZADO|FECHA|TIPO_DOCUMENTO|TOKEN_UNICO
```

Orden obligatorio:

| Posición | Campo | Ejemplo |
|---:|---|---|
| 1 | versión | `SAGC1` |
| 2 | folio | `2026-A-1380` |
| 3 | nombre normalizado | `MARIA-JOSE-MUNOZ-LOPEZ` |
| 4 | fecha de emisión | `2026-09-08` |
| 5 | clave de tipo documental | `CONSTANCIA` |
| 6 | token único | `8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10` |

Ejemplo completo:

```text
SAGC1|2026-A-1380|MARIA-JOSE-MUNOZ-LOPEZ|2026-09-08|CONSTANCIA|8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10
```

---

## 3. Momento de generación

La cadena se genera únicamente cuando ya existen:

1. datos del evento confirmados;
2. nombre definitivo de la persona;
3. tipo documental definitivo;
4. folio asignado;
5. token único asignado;
6. fecha oficial de emisión.

Secuencia:

```text
VALIDAR DATOS
    ↓
ASIGNAR FOLIO
    ↓
GENERAR TOKEN
    ↓
FIJAR FECHA DE EMISIÓN
    ↓
CANONICALIZAR CAMPOS
    ↓
CONSTRUIR CADENA ORIGINAL
    ↓
PERSISTIR EN MYSQL
    ↓
GENERAR QR / DOCUMENTO
```

La cadena nunca debe construirse en React.

Debe generarse en backend o en un servicio controlado por SAGC.

---

## 4. Datos de entrada V1

La versión 1 utiliza exclusivamente:

```text
folio
nombre_persona
fecha_emision
tipo_documento.clave
token_unico
```

El marcador `SAGC1` es constante.

### Campos que NO intervienen en V1

Aunque puedan almacenarse en la base de datos, la V1 no incorpora directamente:

- proyecto;
- área;
- modalidad;
- nombre del evento;
- ID del evento;
- autoridad;
- plantilla;
- texto del reconocimiento;
- estado de la constancia.

La razón es conservar el contrato posicional de seis bloques definido para la cadena original y evitar invalidar una cadena cuando cambie información descriptiva no esencial.

Si en el futuro se requiere incorporar otros campos se deberá crear una nueva versión, por ejemplo `SAGC2`.

---

## 5. Codificación

Toda cadena se construye como texto **UTF-8**.

No se permite:

- UTF-16;
- codificaciones dependientes del sistema operativo;
- saltos de línea;
- caracteres de control sin escapar.

El resultado se almacena exactamente en:

```text
constancias.cadena_validacion
```

En SAGC V1, esa columna contiene la Cadena Original oficial.

---

## 6. Canonicalización del folio

El folio se recibe del servicio oficial **Folio Único SAGC V1** y debe tener exactamente:

```text
AAAA-X-XXXX
```

Ejemplo:

```text
2026-A-1380
```

Reglas:

1. eliminar espacios accidentales;
2. convertir la serie a mayúscula;
3. validar `^[0-9]{4}-[A-Z]-[0-9]{4}$`;
4. rechazar consecutivo `0000`;
5. conservar exactamente el valor resultante.

La cadena original no crea ni incrementa folios. Solo consume el folio que previamente asignó el servicio definido en:

```text
docs/METODOLOGIA_FOLIO_UNICO.md
```

---

## 7. Canonicalización del nombre

El nombre se utiliza únicamente para la cadena original; el nombre mostrado en la constancia conserva su ortografía normal.

Reglas:

1. eliminar espacios al inicio/final;
2. colapsar múltiples espacios;
3. normalizar Unicode mediante **NFKD**;
4. retirar marcas diacríticas;
5. convertir a mayúsculas;
6. sustituir secuencias de caracteres distintos de `A-Z` y `0-9` por un guion `-`;
7. colapsar guiones consecutivos;
8. eliminar guiones al inicio/final.

Ejemplos:

| Entrada | Nombre canónico |
|---|---|
| `María José Muñoz López` | `MARIA-JOSE-MUNOZ-LOPEZ` |
| `  Ana   Pérez  ` | `ANA-PEREZ` |
| `José O'Connor` | `JOSE-O-CONNOR` |

La eliminación de diacríticos no pretende reemplazar el nombre legal. Solo crea una representación estable para la cadena.

---

## 8. Fecha de emisión

Formato único:

```text
YYYY-MM-DD
```

Ejemplo:

```text
2026-09-08
```

Debe representar la fecha oficial de emisión del documento.

No se debe generar usando el formato regional del navegador.

Son inválidos:

```text
08/09/2026
09/08/2026
8-sep-2026
2026-9-8
```

---

## 9. Tipo documental

Se utiliza la columna:

```text
tipos_documento.clave
```

No el nombre visible.

Reglas:

1. Unicode NFKD;
2. eliminar diacríticos;
3. mayúsculas;
4. espacios convertidos a `_`;
5. otros separadores no alfanuméricos convertidos a `_`;
6. colapsar guiones bajos repetidos.

Ejemplos:

```text
Constancia       → CONSTANCIA
Reconocimiento   → RECONOCIMIENTO
Otros especial   → OTROS_ESPECIAL
```

---

## 10. Token único

La cadena original recibe el token **después** de que el subsistema de token lo haya generado.

Para la cadena:

- se elimina únicamente espacio exterior accidental;
- se conserva mayúscula/minúscula;
- no se transforma su contenido;
- debe ser no vacío;
- no puede ser editable por el operador.

La metodología criptográfica y el formato definitivo del token se documentan separadamente.

---

## 11. Escape de caracteres reservados

El carácter `|` es el separador estructural de la cadena y nunca puede aparecer literalmente dentro de un campo.

Antes de concatenar, cada valor se escapa en este orden:

```text
%   → %25
|   → %7C
CR  → %0D
LF  → %0A
```

El escape se aplica después de la canonicalización.

Esto permite distinguir siempre entre:

```text
campo | campo
```

y un valor que originalmente contenía un carácter reservado.

---

## 12. Algoritmo V1

Pseudocódigo normativo:

```text
ENTRADA:
  folio
  nombre_persona
  fecha_emision
  tipo_documento
  token_unico

version = "SAGC1"

folio_canon  = NORMALIZAR_FOLIO(folio)
nombre_canon = NORMALIZAR_NOMBRE(nombre_persona)
fecha_canon  = NORMALIZAR_FECHA(fecha_emision)
tipo_canon   = NORMALIZAR_TIPO(tipo_documento)
token_canon  = TRIM(token_unico)

VALIDAR que ningún valor requerido esté vacío

folio_final  = ESCAPAR(folio_canon)
nombre_final = ESCAPAR(nombre_canon)
fecha_final  = ESCAPAR(fecha_canon)
tipo_final   = ESCAPAR(tipo_canon)
token_final  = ESCAPAR(token_canon)

cadena =
  version + "|" +
  folio_final + "|" +
  nombre_final + "|" +
  fecha_final + "|" +
  tipo_final + "|" +
  token_final

VALIDAR longitud UTF-8 <= 512 bytes

SALIDA:
  cadena
```

---

## 13. Vector oficial de prueba V1

Entrada:

```json
{
  "folio": "2026-A-1380",
  "nombre_persona": "María José Muñoz López",
  "fecha_emision": "2026-09-08",
  "tipo_documento": "CONSTANCIA",
  "token_unico": "8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10"
}
```

Salida exacta:

```text
SAGC1|2026-A-1380|MARIA-JOSE-MUNOZ-LOPEZ|2026-09-08|CONSTANCIA|8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10
```

SHA-256 de la cadena UTF-8, utilizado como vector de control técnico:

```text
701f5fd806aa97854775208597b0ca3b370c9e8428e33289d1513f4ab211886e
```

El SHA-256 anterior **no forma parte de la cadena**. Solo permite comprobar que otra implementación produjo exactamente los mismos bytes.

---

## 14. Reglas de persistencia

Al confirmar una emisión se guardan, como mínimo:

```text
folio
token_unico
cadena_validacion
fecha_emision
estado
```

Reglas:

- `cadena_validacion` no puede modificarse manualmente;
- `folio` no puede modificarse después de emisión;
- `token_unico` no puede modificarse después de emisión;
- una corrección anterior a la emisión puede regenerar la cadena;
- una corrección posterior a la emisión debe resolverse mediante cancelación/reexpedición según la política institucional.

---

## 15. Cancelación

Cancelar una constancia:

```text
NO cambia:
folio
token
cadena original
fecha original
```

Solo cambia su estado y los metadatos de cancelación.

Esto permite que el validador reconozca la misma emisión histórica como cancelada.

---

## 16. Reexpedición

Una reexpedición es una nueva emisión.

Debe recibir:

- nuevo folio conforme a la Metodología de Folio Único SAGC V1;
- nuevo token;
- nueva cadena original;
- nueva fecha de emisión;
- referencia a `id_constancia_origen`.

Nunca se reutiliza la cadena de la emisión anterior.

---

## 17. Relación con el QR

La cadena original no debe colocarse completa en la URL del QR.

La ruta recomendada permanece:

```text
https://dominio/sagc/validacion/<token>
```

El validador obtiene por token el registro persistido y puede mostrar o comparar la cadena cuando sea necesario.

Esto evita exponer el nombre completo dentro de una URL.

---

## 18. Integridad criptográfica

La Cadena Original V1 es la **entrada canónica** sobre la cual puede aplicarse un mecanismo de integridad.

Posibles capas posteriores:

```text
SHA-256(cadena_original)
HMAC-SHA-256(cadena_original, secreto_servidor)
FIRMA_DIGITAL(cadena_original, clave_privada)
```

Estas operaciones no deben alterar el formato `SAGC1`.

Si se añade un sello criptográfico, debe almacenarse como un campo separado.

---

## 19. Seguridad

La cadena:

- no es una contraseña;
- no sustituye autenticación;
- no debe utilizarse como secreto;
- contiene datos identificables del titular;
- no debe colocarse innecesariamente en URLs;
- debe tratarse como información de la emisión;
- debe generarse solo con datos validados.

La autenticidad pública proviene del registro controlado por SAGC, el token/QR y, cuando se adopte, un sello criptográfico.

---

## 20. Versionado

Nunca se cambia silenciosamente el algoritmo de una versión existente.

Si cambia:

- orden de campos;
- normalización;
- escape;
- campos incluidos;
- semántica;

se crea una nueva versión:

```text
SAGC2
```

Los documentos `SAGC1` siguen validándose con las reglas de V1.

---

## 21. Implementación de referencia

La implementación oficial de referencia para desarrollo se encuentra en:

```text
server/src/services/identifiers/cadena-original.js
```

El vector de prueba ejecutable está en:

```text
server/src/scripts/check-cadena-original.js
```

Ejecutar desde la raíz:

```bash
npm --prefix server run chain:test
```

Una implementación futura en otro lenguaje debe producir exactamente el mismo vector oficial antes de considerarse compatible con SAGC1.