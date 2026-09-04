import argon2 from 'argon2';
import { pool } from '../config/db.js';
import 'dotenv/config';

const nombre = process.env.SAGC_BOOTSTRAP_ADMIN_NAME;
const usuario = process.env.SAGC_BOOTSTRAP_ADMIN_USER;
const password = process.env.SAGC_BOOTSTRAP_ADMIN_PASSWORD;

if (!nombre || !usuario || !password) {
  console.error(
    'Configura SAGC_BOOTSTRAP_ADMIN_NAME, SAGC_BOOTSTRAP_ADMIN_USER y SAGC_BOOTSTRAP_ADMIN_PASSWORD en server/.env.'
  );
  process.exit(1);
}

if (password === 'CAMBIAR_ESTA_CONTRASENA' || password.length < 12) {
  console.error('Usa una contraseña de desarrollo distinta y de al menos 12 caracteres.');
  process.exit(1);
}

try {
  const [existing] = await pool.execute(
    'SELECT id_usuario FROM usuarios WHERE usuario = ? LIMIT 1',
    [usuario]
  );

  if (existing.length) {
    console.error(`El usuario "${usuario}" ya existe. No se modificó.`);
    process.exitCode = 1;
  } else {
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    const [result] = await pool.execute(
      `INSERT INTO usuarios
        (nombre, usuario, password_hash, permiso, activo)
       VALUES (?, ?, ?, 'ADMIN', TRUE)`,
      [nombre, usuario, passwordHash]
    );

    console.log(`Administrador creado con id ${result.insertId}.`);
    console.log('La contraseña no se guardó en texto plano.');
  }
} catch (error) {
  console.error('No fue posible crear el administrador.');
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
