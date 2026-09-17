import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = String(process.env.SUPABASE_URL || '').trim();
const supabaseSecretKey = String(process.env.SUPABASE_SECRET_KEY || '').trim();

function isConfigured(value) {
  return Boolean(
    value &&
      !value.includes('CAMBIAR_') &&
      !value.includes('TU_PROJECT_REF')
  );
}

export const supabaseConfigured =
  isConfigured(supabaseUrl) && isConfigured(supabaseSecretKey);

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado. Define SUPABASE_URL y SUPABASE_SECRET_KEY en server/.env.'
    );
  }

  return supabase;
}

export async function checkDatabaseConnection() {
  const client = requireSupabase();
  const { data, error } = await client.rpc('sagc_healthcheck');

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
