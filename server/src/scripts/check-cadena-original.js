import assert from 'node:assert/strict';
import {
  generarCadenaOriginal,
  sha256CadenaOriginal,
} from '../services/identifiers/cadena-original.js';

const input = {
  folio: 'FGRO/26/A/001380',
  nombre_persona: 'María José Muñoz López',
  fecha_emision: '2026-09-08',
  tipo_documento: 'CONSTANCIA',
  token_unico: '8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10',
};

const expected =
  'SAGC1|FGRO/26/A/001380|MARIA-JOSE-MUNOZ-LOPEZ|2026-09-08|CONSTANCIA|8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10';

const expectedSha256 =
  '0882b0e5eab280b80cfbe2777fdff696e502af84842fd4459ba289505de4b0e6';

const result = generarCadenaOriginal(input);
const hash = sha256CadenaOriginal(result);

assert.equal(result, expected);
assert.equal(hash, expectedSha256);

console.log('Cadena Original SAGC1: OK');
console.log(result);
console.log('SHA-256:', hash);
