import mysql from 'mysql2/promise';
import 'dotenv/config';

const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Falta la variable de entorno ${key}`);
  }
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'Z',
  namedPlaceholders: true,
  enableKeepAlive: true,
});

export async function checkDatabaseConnection() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT DATABASE() AS database_name, VERSION() AS mysql_version, NOW() AS server_time'
    );
    return rows[0];
  } finally {
    connection.release();
  }
}
