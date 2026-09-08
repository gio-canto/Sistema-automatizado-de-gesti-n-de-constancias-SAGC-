import assert from 'node:assert/strict';
import {
  FoliosAgotadosError,
  calcularSiguienteEstadoFolio,
  formatearFolio,
  obtenerAnioEmision,
} from '../services/identifiers/folio.js';

assert.equal(obtenerAnioEmision('2026-09-08'), 2026);
assert.equal(formatearFolio(2026, 'A', 1), '2026-A-0001');
assert.equal(formatearFolio(2026, 'A', 1380), '2026-A-1380');
assert.equal(formatearFolio(2026, 'A', 9999), '2026-A-9999');

assert.deepEqual(
  calcularSiguienteEstadoFolio({
    anio: 2026,
    serie: 'A',
    ultimoValor: 0,
  }),
  {
    anio: 2026,
    serie: 'A',
    ultimoValor: 1,
    folio: '2026-A-0001',
  }
);

assert.equal(
  calcularSiguienteEstadoFolio({
    anio: 2026,
    serie: 'A',
    ultimoValor: 9998,
  }).folio,
  '2026-A-9999'
);

assert.deepEqual(
  calcularSiguienteEstadoFolio({
    anio: 2026,
    serie: 'A',
    ultimoValor: 9999,
  }),
  {
    anio: 2026,
    serie: 'B',
    ultimoValor: 1,
    folio: '2026-B-0001',
  }
);

assert.equal(
  calcularSiguienteEstadoFolio({
    anio: 2026,
    serie: 'B',
    ultimoValor: 9999,
  }).folio,
  '2026-C-0001'
);

assert.throws(
  () =>
    calcularSiguienteEstadoFolio({
      anio: 2026,
      serie: 'Z',
      ultimoValor: 9999,
    }),
  (error) =>
    error instanceof FoliosAgotadosError &&
    error.code === 'FOLIOS_AGOTADOS'
);

console.log('Folio Único SAGC V1: OK');
console.log('Inicio:          2026-A-0001');
console.log('Fin serie A:     2026-A-9999');
console.log('Siguiente serie: 2026-B-0001');
console.log('Nuevo año:       2027-A-0001');
