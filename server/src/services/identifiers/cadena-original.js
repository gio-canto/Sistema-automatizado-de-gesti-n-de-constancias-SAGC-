import { normalizarTokenUnico } from './token.js';

export const CADENA_ORIGINAL_MAX_BYTES = 1024;

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

function normalizarTextoConGuiones(value, fieldName) {
  const result = stripDiacritics(required(value, fieldName))
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!result) {
    throw new Error(
      `El campo ${fieldName} no produce una representación canónica válida.`
    );
  }

  return result;
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
  return normalizarTextoConGuiones(value, 'nombre_persona');
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

export function normalizarEventoEmision(value) {
  const result = normalizarTextoConGuiones(value, 'evento_emision');

  if (result.length > 255) {
    throw new Error('evento_emision excede 255 caracteres después de normalizarse.');
  }

  return result;
}

export function normalizarToken(value) {
  return normalizarTokenUnico(value);
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
  evento_emision,
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
    folioCanon,
    normalizarNombre(nombre_persona),
    fechaCanon,
    normalizarTipoDocumento(tipo_documento),
    normalizarEventoEmision(evento_emision),
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