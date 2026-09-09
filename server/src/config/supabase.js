import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const required = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY'];

for (const key of required) {
  const value = String(process.env[key] || '').trim();

  if (!value || value.includes('CAMBIAR_') || value.includes('TU_PROJECT_REF')) {
    throw new Error(`Falta configurar correctamente la variable de entorno ${key}`);
  }
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

export async function checkDatabaseConnection() {
  const { data, error } = await supabase.rpc('sagc_healthcheck');

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
