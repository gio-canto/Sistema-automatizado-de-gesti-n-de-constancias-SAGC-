export const FOLIO_SERIE_INICIAL = 'A';
export const FOLIO_SERIE_FINAL = 'Z';
export const FOLIO_MAX_CONSECUTIVO = 9999;

export class FoliosAgotadosError extends Error {
  constructor(anio) {
    super(`Se agotaron los folios disponibles para el año ${anio}.`);
    this.name = 'FoliosAgotadosError';
    this.code = 'FOLIOS_AGOTADOS';
    this.anio = anio;
  }
}

export function obtenerAnioEmision(fechaEmision) {
  if (fechaEmision instanceof Date) {
    const anio = fechaEmision.getUTCFullYear();
    if (!Number.isInteger(anio)) throw new Error('Fecha de emisión inválida.');
    return anio;
  }

  const text = String(fechaEmision ?? '').trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);

  if (!match) {
    throw new Error('fecha_emision debe iniciar con YYYY-MM-DD.');
  }

  const anio = Number(match[1]);
  const mes = Number(match[2]);
  const dia = Number(match[3]);
  const date = new Date(Date.UTC(anio, mes - 1, dia));

  if (
    date.getUTCFullYear() !== anio ||
    date.getUTCMonth() + 1 !== mes ||
    date.getUTCDate() !== dia
  ) {
    throw new Error('fecha_emision contiene una fecha inexistente.');
  }

  return anio;
}

export function validarSerie(serie) {
  return typeof serie === 'string' && /^[A-Z]$/.test(serie);
}

export function formatearFolio(anio, serie, consecutivo) {
  if (!Number.isInteger(anio) || anio < 1000 || anio > 9999) {
    throw new Error('El año del folio debe tener cuatro dígitos.');
  }

  if (!validarSerie(serie)) {
    throw new Error('La serie del folio debe estar entre A y Z.');
  }

  if (
    !Number.isInteger(consecutivo) ||
    consecutivo < 1 ||
    consecutivo > FOLIO_MAX_CONSECUTIVO
  ) {
    throw new Error('El consecutivo del folio debe estar entre 0001 y 9999.');
  }

  return `${anio}-${serie}-${String(consecutivo).padStart(4, '0')}`;
}

export function calcularSiguienteEstadoFolio({
  anio,
  serie = FOLIO_SERIE_INICIAL,
  ultimoValor = 0,
}) {
  if (!validarSerie(serie)) {
    throw new Error('Serie de contador inválida.');
  }

  if (
    !Number.isInteger(ultimoValor) ||
    ultimoValor < 0 ||
    ultimoValor > FOLIO_MAX_CONSECUTIVO
  ) {
    throw new Error('ultimo_valor debe estar entre 0 y 9999.');
  }

  if (ultimoValor < FOLIO_MAX_CONSECUTIVO) {
    const siguiente = ultimoValor + 1;
    return {
      anio,
      serie,
      ultimoValor: siguiente,
      folio: formatearFolio(anio, serie, siguiente),
    };
  }

  if (serie === FOLIO_SERIE_FINAL) {
    throw new FoliosAgotadosError(anio);
  }

  const siguienteSerie = String.fromCharCode(serie.charCodeAt(0) + 1);

  return {
    anio,
    serie: siguienteSerie,
    ultimoValor: 1,
    folio: formatearFolio(anio, siguienteSerie, 1),
  };
}

/**
 * Reserva el siguiente Folio Único mediante una función PostgreSQL
 * ejecutada por Supabase.
 *
 * La función public.asignar_siguiente_folio() serializa el contador
 * del año con SELECT ... FOR UPDATE dentro de PostgreSQL.
 */
export async function asignarSiguienteFolio(
  supabaseClient,
  fechaEmision
) {
  const anio = obtenerAnioEmision(fechaEmision);
  const fecha =
    fechaEmision instanceof Date
      ? fechaEmision.toISOString().slice(0, 10)
      : String(fechaEmision).trim().slice(0, 10);

  const { data, error } = await supabaseClient.rpc(
    'asignar_siguiente_folio',
    { p_fecha_emision: fecha }
  );

  if (error) {
    if (
      error.message?.includes('FOLIOS_AGOTADOS') ||
      error.details?.includes('FOLIOS_AGOTADOS')
    ) {
      throw new FoliosAgotadosError(anio);
    }

    throw new Error(
      `No fue posible asignar el siguiente folio: ${error.message}`
    );
  }

  return data;
}
