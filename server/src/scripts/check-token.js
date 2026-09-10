import assert from 'node:assert/strict';
import {
  UUID_V4_REGEX,
  esTokenUnicoValido,
  generarTokenUnico,
  normalizarTokenUnico,
} from '../services/identifiers/token.js';

const tokenA = generarTokenUnico();
const tokenB = generarTokenUnico();

assert.equal(tokenA.length, 36);
assert.equal(tokenB.length, 36);
assert.match(tokenA, UUID_V4_REGEX);
assert.match(tokenB, UUID_V4_REGEX);
assert.notEqual(tokenA, tokenB);

assert.equal(
  normalizarTokenUnico(
    '7F0C55CA-3AC5-49A0-8B86-98DD96CEF072'
  ),
  '7f0c55ca-3ac5-49a0-8b86-98dd96cef072'
);

assert.equal(
  esTokenUnicoValido('7f0c55ca-3ac5-49a0-8b86-98dd96cef072'),
  true
);

assert.equal(
  esTokenUnicoValido('8f3a7c21-d4e9-5b60-9a01-7e2c4b6d8f10'),
  false
);

assert.equal(esTokenUnicoValido('TOKEN-1234'), false);

console.log('Token Único SAGC UUIDv4: OK');
console.log('Ejemplo generado:', tokenA);
