import { createHash } from 'node:crypto';
import {
  createLoginCapChallenge,
  deriveCapTokenKey,
} from '../services/captcha/cap.js';

process.env.CAP_SECRET =
  process.env.CAP_SECRET ||
  'sagc-ci-cap-secret-0123456789abcdef0123456789abcdef';

const challenge = await createLoginCapChallenge();

if (!challenge || typeof challenge !== 'object') {
  throw new Error('Cap no generó un challenge válido.');
}

if (!challenge.token || !challenge.challenge) {
  throw new Error('El challenge Cap no contiene token/challenge.');
}

if (!challenge.instrumentation) {
  throw new Error('La instrumentation de Cap debe permanecer activada.');
}

const sample = 'id-prueba:verification-token-prueba';
const expected =
  'id-prueba:' +
  createHash('sha256')
    .update('verification-token-prueba')
    .digest('hex');

if (deriveCapTokenKey(sample) !== expected) {
  throw new Error('La derivación de tokenKey de Cap no coincide con la especificación.');
}

if (deriveCapTokenKey('token-invalido') !== null) {
  throw new Error('Un token CAP inválido no debe producir tokenKey.');
}

console.log('Cap Core correcto · challenge + instrumentation + tokenKey.');
