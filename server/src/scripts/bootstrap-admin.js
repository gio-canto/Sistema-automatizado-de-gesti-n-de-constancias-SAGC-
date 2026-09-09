import argon2 from 'argon2';
import { supabase } from '../config/supabase.js';
import 'dotenv/config';

const nombre = String(process.env.SAGC_BOOTSTRAP_ADMIN_NAME || '').trim();
const usuario = String(process.env.SAGC_BOOTSTRAP_ADMIN_USER || '')
  .trim()
  .toLowerCase();
const password = String(process.env.SAGC_BOOTSTRAP_ADMIN_PASSWORD || '');

if (!nombre || !usuario || !password) {
  console.error(
    'Configura SAGC_BOOTSTRAP_ADMIN_NAME, SAGC_BOOTSTRAP_ADMIN_USER y SAGC_BOOTSTRAP_ADMIN_PASSWORD en server/.env.'
  );
  process.exit(1);
}

if (password === 'CAMBIAR_ESTA_CONTRASENA' || password.length < 12) {
  console.error(
    'Usa una contraseña de desarrollo distinta y de al menos 12 caracteres.'
  );
  process.exit(1);
}

try {
  const { data: existing, error: lookupError } = await supabase
    .from('usuarios')
    .select('id_usuario')
    .eq('usuario', usuario)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existing) {
    console.error(`El usuario "${usuario}" ya existe. No se modificó.`);
    process.exitCode = 1;
  } else {
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const { data: created, error: insertError } = await supabase
      .from('usuarios')
      .insert({
        nombre,
        usuario,
        password_hash: passwordHash,
        permiso: 'ADMIN',
        activo: true,
      })
      .select('id_usuario')
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log(`Administrador creado con id ${created.id_usuario}.`);
    console.log('La contraseña no se guardó en texto plano.');
  }
} catch (error) {
  console.error('No fue posible crear el administrador.');
  console.error(error.message);
  process.exitCode = 1;
}
