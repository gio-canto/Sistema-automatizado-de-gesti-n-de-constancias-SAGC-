import { createHash } from 'node:crypto';
import { generateChallenge, validateChallenge } from 'capjs-core';
import { requireSupabase, supabaseConfigured } from '../../config/supabase.js';

const LOGIN_SCOPE = 'sagc-login';
const LOGIN_TOKEN_TTL_MS = 5 * 60 * 1000;

function getCapSecret() {
  const secret = String(process.env.CAP_SECRET || '');
  if (Buffer.byteLength(secret, 'utf8') < 16) {
    const error = new Error(
      'CAP_SECRET no está configurado o es demasiado corto. Genere uno con npm run cap:secret.'
    );
    error.code = 'CAP_NOT_CONFIGURED';
    throw error;
  }
  return secret;
}

async function consumeChallengeNonce(signature, ttlMs) {
  const client = requireSupabase();
  const expiresAt = new Date(Date.now() + Math.max(1, Number(ttlMs) || 1)).toISOString();

  const { data, error } = await client.rpc('sagc_cap_consume_nonce', {
    p_signature: signature,
    p_expires_at: expiresAt,
  });

  if (error) throw error;
  return data === true;
}

async function storeRedeemToken(tokenKey, expires) {
  const client = requireSupabase();
  const expiresAt = new Date(Number(expires)).toISOString();

  const { data, error } = await client.rpc('sagc_cap_store_token', {
    p_token_key: tokenKey,
    p_expires_at: expiresAt,
  });

  if (error) throw error;
  if (data !== true) {
    throw new Error('No fue posible almacenar el token CAP de un solo uso.');
  }
}

export function deriveCapTokenKey(tokenValue) {
  const token = String(tokenValue || '');
  const parts = token.split(':');

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return null;
  }

  const [id, verificationToken] = parts;
  const digest = createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  return `${id}:${digest}`;
}

export async function createLoginCapChallenge() {
  return generateChallenge(getCapSecret(), {
    scope: LOGIN_SCOPE,
    instrumentation: true,
  });
}

export async function redeemLoginCapChallenge(body) {
  const result = await validateChallenge(
    getCapSecret(),
    {
      token: body?.token,
      solutions: body?.solutions,
      instr: body?.instr,
      instr_blocked: body?.instr_blocked,
      instr_timeout: body?.instr_timeout,
    },
    {
      scope: LOGIN_SCOPE,
      tokenTtlMs: LOGIN_TOKEN_TTL_MS,
      consumeNonce: consumeChallengeNonce,
    }
  );

  if (!result.success) {
    return {
      success: false,
      reason: result.reason || 'verification_failed',
    };
  }

  await storeRedeemToken(result.tokenKey, result.expires);

  return {
    success: true,
    token: result.token,
    expires: result.expires,
  };
}

export async function consumeLoginCapToken(tokenValue) {
  const tokenKey = deriveCapTokenKey(tokenValue);
  if (!tokenKey) return false;

  const client = requireSupabase();
  const { data, error } = await client.rpc('sagc_cap_consume_token', {
    p_token_key: tokenKey,
  });

  if (error) throw error;
  return data === true;
}

export async function getCapStatus() {
  const configured =
    Buffer.byteLength(String(process.env.CAP_SECRET || ''), 'utf8') >= 16;

  const status = {
    configured,
    storageReady: false,
    ready: false,
    mode: 'core',
    scope: LOGIN_SCOPE,
    tokenTtlSeconds: LOGIN_TOKEN_TTL_MS / 1000,
    reason: null,
  };

  if (!configured) {
    status.reason = 'CAP_SECRET_MISSING';
    return status;
  }

  if (!supabaseConfigured) {
    status.reason = 'CAP_SUPABASE_NOT_CONFIGURED';
    return status;
  }

  try {
    const client = requireSupabase();

    const [noncesCheck, tokensCheck] = await Promise.all([
      client
        .from('cap_nonces')
        .select('signature', { count: 'exact', head: true }),
      client
        .from('cap_tokens')
        .select('token_key', { count: 'exact', head: true }),
    ]);

    if (noncesCheck.error || tokensCheck.error) {
      status.reason = 'CAP_STORAGE_MISSING';
      status.detail =
        noncesCheck.error?.message ||
        tokensCheck.error?.message ||
        null;
      return status;
    }

    status.storageReady = true;
    status.ready = true;
    return status;
  } catch (error) {
    status.reason = 'CAP_DATABASE_UNAVAILABLE';
    status.detail = error?.message || null;
    return status;
  }
}
