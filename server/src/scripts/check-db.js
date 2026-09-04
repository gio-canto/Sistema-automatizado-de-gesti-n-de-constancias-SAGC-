import { checkDatabaseConnection, pool } from '../config/db.js';

try {
  const info = await checkDatabaseConnection();
  console.log('Conexión MySQL correcta.');
  console.table([info]);
  process.exitCode = 0;
} catch (error) {
  console.error('No fue posible conectar con MySQL.');
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
