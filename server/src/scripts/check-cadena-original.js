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
  token_unico: '8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10',
};

const expected =
  'SAGC1|2026-A-1380|MARIA-JOSE-MUNOZ-LOPEZ|2026-09-08|CONSTANCIA|8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10';

const expectedSha256 =
  '701f5fd806aa97854775208597b0ca3b370c9e8428e33289d1513f4ab211886e';

const result = generarCadenaOriginal(input);
const hash = sha256CadenaOriginal(result);

assert.equal(result, expected);
assert.equal(hash, expectedSha256);

console.log('Cadena Original SAGC1: OK');
console.log(result);
console.log('SHA-256:', hash);