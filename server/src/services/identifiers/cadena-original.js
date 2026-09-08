import { createHash } from 'node:crypto';

export const CADENA_ORIGINAL_VERSION = 'SAGC1';
export const CADENA_ORIGINAL_MAX_BYTES = 512;

function required(value, fieldName) {
  const text = String(value ?? '').trim();

  if (!text) {
    throw new Error(`El campo ${fieldName} es obligatorio para la cadena original.`);
  }

  return text;
}

function stripDiacritics(value) {
  return value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '');
}

export function normalizarFolio(value) {
  const result = required(value, 'folio')
    .toUpperCase()
    .replace(/\s+/g, '');

  if (!/^\d{4}-[A-Z]-\d{4}$/.test(result)) {
    throw new Error('folio debe utilizar el formato AAAA-X-XXXX.');
  }

  const consecutivo = Number(result.slice(-4));

  if (consecutivo < 1 || consecutivo > 9999) {
    throw new Error('El consecutivo del folio debe estar entre 0001 y 9999.');
  }

  return result;
}

export function normalizarNombre(value) {
  const result = stripDiacritics(required(value, 'nombre_persona'))
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!result) {
    throw new Error('El nombre no produce una representación canónica válida.');
  }

  return result;
}

export function normalizarFecha(value) {
  const text = required(value, 'fecha_emision');

  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error('fecha_emision debe utilizar YYYY-MM-DD.');
  }

  const [year, month, day] = text.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    throw new Error('fecha_emision contiene una fecha inexistente.');
  }

  return text;
}

export function normalizarTipoDocumento(value) {
  const result = stripDiacritics(required(value, 'tipo_documento'))
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  if (!result) {
    throw new Error('tipo_documento no produce una clave canónica válida.');
  }

  return result;
}

export function normalizarToken(value) {
  return required(value, 'token_unico');
}

export function escaparCampoCadena(value) {
  return String(value)
    .replace(/%/g, '%25')
    .replace(/\|/g, '%7C')
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A');
}

export function generarCadenaOriginal({
  folio,
  nombre_persona,
  fecha_emision,
  tipo_documento,
  token_unico,
}) {
  const folioCanon = normalizarFolio(folio);
  const fechaCanon = normalizarFecha(fecha_emision);

  if (folioCanon.slice(0, 4) !== fechaCanon.slice(0, 4)) {
    throw new Error(
      'El año del folio debe coincidir con el año de fecha_emision.'
    );
  }

  const campos = [
    CADENA_ORIGINAL_VERSION,
    folioCanon,
    normalizarNombre(nombre_persona),
    fechaCanon,
    normalizarTipoDocumento(tipo_documento),
    normalizarToken(token_unico),
  ].map(escaparCampoCadena);

  const cadena = campos.join('|');
  const bytes = Buffer.byteLength(cadena, 'utf8');

  if (bytes > CADENA_ORIGINAL_MAX_BYTES) {
    throw new Error(
      `La cadena original excede el máximo de ${CADENA_ORIGINAL_MAX_BYTES} bytes.`
    );
  }

  return cadena;
}

export function sha256CadenaOriginal(cadena) {
  return createHash('sha256')
    .update(String(cadena), 'utf8')
    .digest('hex');
}