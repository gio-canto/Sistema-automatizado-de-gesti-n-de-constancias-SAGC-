import 'dotenv/config';
import {
  createLoginCapChallenge,
  getCapStatus,
} from '../services/captcha/cap.js';

const status = await getCapStatus();

if (!status.ready) {
  const messages = {
    CAP_SECRET_MISSING:
      'Falta CAP_SECRET en server/.env. Genérelo con: npm run cap:secret',
    CAP_STORAGE_MISSING:
      'Falta la migración de Cap en Supabase. Ejecute database/migrations/002_cap_captcha.sql.',
    CAP_DATABASE_UNAVAILABLE:
      'No fue posible acceder a Supabase/PostgreSQL con la configuración actual.',
    CAP_STATUS_ERROR:
      'No fue posible comprobar el estado de Cap.',
  };

  console.error('CAP no está listo.');
  console.error(messages[status.reason] || status.reason || 'Estado desconocido.');
  process.exit(1);
}

const challenge = await createLoginCapChallenge();

if (!challenge?.token || !challenge?.challenge) {
  throw new Error('Cap Core no generó un challenge válido.');
}

console.log('CAP listo · secreto ✓ · PostgreSQL ✓ · challenge ✓');
console.log(`Modo: ${status.mode} · scope: ${status.scope} · token TTL: ${status.tokenTtlSeconds}s`);
