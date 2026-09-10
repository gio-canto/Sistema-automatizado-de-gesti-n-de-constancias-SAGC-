import { randomUUID } from 'node:crypto';

export const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function normalizarTokenUnico(value) {
  const token = String(value ?? '').trim().toLowerCase();

  if (!UUID_V4_REGEX.test(token)) {
    throw new Error('token_unico debe ser un UUID versión 4 válido.');
  }

  return token;
}

export function esTokenUnicoValido(value) {
  try {
    normalizarTokenUnico(value);
    return true;
  } catch {
    return false;
  }
}

export function generarTokenUnico() {
  const token = randomUUID();

  if (!UUID_V4_REGEX.test(token)) {
    throw new Error('Node.js generó un UUID que no cumple UUIDv4.');
  }

  return token;
}
