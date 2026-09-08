import assert from 'node:assert/strict';
import {
  generarCadenaOriginal,
  sha256CadenaOriginal,
} from '../services/identifiers/cadena-original.js';

const input = {
  folio: '2026-A-1380',
  nombre_persona: 'María José Muñoz López',
  fecha_emision: '2026-09-08',
  tipo_documento: 'CONSTANCIA',
  evento_emision: 'XXX Foro de Estudios sobre Guerrero',
  token_unico: '8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10',
};

const expected =
  '2026-A-1380|MARIA-JOSE-MUNOZ-LOPEZ|2026-09-08|CONSTANCIA|XXX-FORO-DE-ESTUDIOS-SOBRE-GUERRERO|8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10';

const expectedSha256 =
  'e15297325430c9ed0f4df503495ff7c84f9042f90537e9251edd5d76ecd3d9b6';

const result = generarCadenaOriginal(input);
const hash = sha256CadenaOriginal(result);

assert.equal(result, expected);
assert.equal(hash, expectedSha256);

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

console.log('Cadena Original SAGC: OK');
console.log(result);
console.log('SHA-256:', hash);
