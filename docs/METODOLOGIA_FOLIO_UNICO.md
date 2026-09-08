# Metodología de Folio Único SAGC

**Código:** MFU-SAGC-V1  
**Versión:** 1.0  
**Formato:** `AAAA-X-XXXX`  
**Estado:** metodología técnica definida para desarrollo

---

## 1. Objetivo

Cada documento emitido por SAGC debe recibir un folio único, legible y consecutivo dentro del año de emisión.

Formato normativo:

```text
AAAA-X-XXXX
```

donde:

- `AAAA`: año de emisión con cuatro dígitos;
- `X`: serie alfabética de una letra;
- `XXXX`: consecutivo decimal de cuatro dígitos.

Ejemplos:

```text
2026-A-0001
2026-A-0002
2026-A-9999
2026-B-0001
```

---

## 2. Inicio de cada año

Cada año comienza siempre en:

```text
AAAA-A-0001
```

Ejemplo:

```text
2026-A-0001
2027-A-0001
```

El cambio de año reinicia serie y consecutivo porque el año forma parte del identificador y mantiene la unicidad global.

---

## 3. Consecutivo

El consecutivo válido es:

```text
0001 ... 9999
```

`0000` no es un folio emitido. Solo puede existir internamente en `contador_folios.ultimo_valor` para representar que todavía no se ha emitido ningún documento en ese año.

Los números siempre se representan con cuatro dígitos:

```text
1    → 0001
27   → 0027
932  → 0932
9999 → 9999
```

---

## 4. Cambio de serie

La serie comienza en `A`.

Cuando una serie alcanza `9999`, la siguiente emisión cambia a la letra consecutiva y reinicia el número en `0001`.

Regla:

```text
2026-A-9998
2026-A-9999
2026-B-0001
2026-B-0002
```

Secuencia permitida:

```text
A → B → C → ... → Z
```

Nunca se reutiliza una serie anterior dentro del mismo año.

---

## 5. Agotamiento anual

La última combinación disponible en un año es:

```text
AAAA-Z-9999
```

Capacidad máxima teórica por año:

```text
26 × 9,999 = 259,974 folios
```

Si se alcanza `Z-9999`, SAGC debe rechazar nuevas asignaciones para ese año y generar un error administrativo.

Nunca debe:

- regresar a `A`;
- sobrescribir un folio;
- reutilizar un folio cancelado;
- crear una segunda constancia con el mismo folio.

---

## 6. Fuente del año

El año se obtiene de la **fecha oficial de emisión**, no de la fecha del navegador ni de un valor escrito manualmente por el operador.

Ejemplo:

```text
fecha_emision = 2026-09-08
anio_folio    = 2026
```

---

## 7. Persistencia

La tabla de control mantiene un único estado por año:

```text
contador_folios
├── anio
├── serie
├── ultimo_valor
└── fecha_actualizacion
```

Ejemplo:

```text
anio | serie | ultimo_valor
2026 | A     | 1380
2027 | A     | 0
```

La clave primaria es `anio`.

---

## 8. Algoritmo normativo

Pseudocódigo:

```text
ENTRADA:
  fecha_emision

anio = AÑO(fecha_emision)

INICIAR TRANSACCIÓN

crear contador del año si no existe:
  anio = año
  serie = A
  ultimo_valor = 0

bloquear fila del año con SELECT ... FOR UPDATE

SI ultimo_valor < 9999:
  siguiente_numero = ultimo_valor + 1
  siguiente_serie = serie

SI ultimo_valor == 9999:
  SI serie == Z:
    ERROR FOLIOS_AGOTADOS
  SI NO:
    siguiente_serie = LETRA_SIGUIENTE(serie)
    siguiente_numero = 1

actualizar contador:
  serie = siguiente_serie
  ultimo_valor = siguiente_numero

folio =
  anio + "-" +
  siguiente_serie + "-" +
  PAD4(siguiente_numero)

insertar constancia utilizando ese folio

COMMIT

SALIDA:
  folio
```

---

## 9. Concurrencia

La asignación se realiza únicamente en backend.

El frontend nunca calcula el siguiente folio.

La operación debe bloquear la fila del año mediante:

```sql
SELECT serie, ultimo_valor
FROM contador_folios
WHERE anio = ?
FOR UPDATE;
```

La asignación del folio y la inserción de la constancia deben pertenecer a la **misma transacción** cuando se implemente el flujo completo de emisión.

Esto evita:

```text
Usuario 1 → 2026-A-0042
Usuario 2 → 2026-A-0042   ← PROHIBIDO
```

---

## 10. Cancelación

Un folio emitido nunca vuelve al contador.

Ejemplo:

```text
2026-A-0100 → CANCELADA
siguiente   → 2026-A-0101
```

No se reasigna `2026-A-0100`.

---

## 11. Reexpedición

Una reexpedición constituye una nueva emisión y recibe el siguiente folio disponible.

Ejemplo:

```text
Original:     2026-A-0200
Reexpedición: 2026-A-0201
```

La relación entre ambas se almacena mediante `id_constancia_origen`.

---

## 12. Restricciones

Un folio válido debe cumplir:

```regex
^[0-9]{4}-[A-Z]-[0-9]{4}$
```

Y adicionalmente:

- el número debe estar entre `0001` y `9999`;
- la serie entre `A` y `Z`;
- el año debe corresponder a la fecha de emisión;
- `constancias.folio` mantiene índice `UNIQUE`.

---

## 13. Casos oficiales de prueba

| Estado actual | Resultado esperado |
|---|---|
| año sin contador | `2026-A-0001` |
| `A / 0001` | `2026-A-0002` |
| `A / 9998` | `2026-A-9999` |
| `A / 9999` | `2026-B-0001` |
| `B / 9999` | `2026-C-0001` |
| `Z / 9999` | error `FOLIOS_AGOTADOS` |
| cambio a 2027 sin contador | `2027-A-0001` |

---

## 14. Integración con Cadena Original

El folio generado se entrega sin transformación semántica a la Cadena Original SAGC V1.

Ejemplo:

```text
2026-A-1380
```

Cadena:

```text
SAGC1|2026-A-1380|NOMBRE_NORMALIZADO|2026-09-08|CONSTANCIA|TOKEN
```

---

## 15. Implementación de referencia

Servicio:

```text
server/src/services/identifiers/folio.js
```

Pruebas:

```text
server/src/scripts/check-folio.js
```

Ejecutar:

```bash
npm --prefix server run folio:test
```
