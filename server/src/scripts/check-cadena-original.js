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
  evento_emision: 'EVT-000138',
  token_unico: '8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10',
};

const expected =
  'SAGC2|2026-A-1380|MARIA-JOSE-MUNOZ-LOPEZ|2026-09-08|CONSTANCIA|EVT-000138|8F3A7C21-D4E9-5B60-9A01-7E2C4B6D8F10';

const expectedSha256 =
  '3b131822cff5af7789ab91eaf6aef26139c41791260170d4a130736da9c65458';

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

console.log('Cadena Original SAGC2: OK');
console.log(result);
console.log('SHA-256:', hash);
