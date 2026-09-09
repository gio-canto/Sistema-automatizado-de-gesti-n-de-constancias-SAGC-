import { checkDatabaseConnection } from '../config/supabase.js';

try {
  const info = await checkDatabaseConnection();
  console.log('Conexión Supabase/PostgreSQL correcta.');
  console.log(info);
  process.exitCode = 0;
} catch (error) {
  console.error('No fue posible conectar con Supabase/PostgreSQL.');
  console.error(error.message);
  process.exitCode = 1;
}
