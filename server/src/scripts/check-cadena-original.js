import assert from 'node:assert/strict';
import {
  generarCadenaOriginal,
} from '../services/identifiers/cadena-original.js';

const input = {
  folio: '2026-A-1380',
  nombre_persona: 'María José Muñoz López',
  fecha_emision: '2026-09-08',
  tipo_documento: 'CONSTANCIA',
  evento_emision: 'XXX Foro de Estudios sobre Guerrero',
  token_unico: '7f0c55ca-3ac5-49a0-8b86-98dd96cef072',
};

const expected =
  '2026-A-1380|MARIA-JOSE-MUNOZ-LOPEZ|2026-09-08|CONSTANCIA|XXX-FORO-DE-ESTUDIOS-SOBRE-GUERRERO|7f0c55ca-3ac5-49a0-8b86-98dd96cef072';

const result = generarCadenaOriginal(input);
assert.equal(result, expected);

assert.throws(
  () =>
    generarCadenaOriginal({
      ...input,
      folio: '2025-A-1380',
    }),
  /año del folio debe coincidir/
);

assert.throws(
  () =>
    generarCadenaOriginal({
      ...input,
      evento_emision: '',
    }),
  /evento_emision/
);

assert.throws(
  () =>
    generarCadenaOriginal({
      ...input,
      token_unico: '8f3a7c21-d4e9-5b60-9a01-7e2c4b6d8f10',
    }),
  /UUID versión 4/
);

console.log('Cadena Original SAGC: OK');
console.log(result);