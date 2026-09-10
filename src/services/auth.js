const DEMO_USER = 'demo';
const DEMO_PASSWORD = 'demo';

export async function authenticateUser({ user, password }) {
  const normalizedUser = String(user ?? '').trim();

  if (
    normalizedUser.toLowerCase() === DEMO_USER &&
    password === DEMO_PASSWORD
  ) {
    return {
      ok: true,
      source: 'demo',
      user: {
        usuario: DEMO_USER,
        nombre: 'Usuario de demostración',
        permiso: 'DEMO',
      },
    };
  }

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: normalizedUser,
        password,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.ok) {
      return {
        ok: false,
        error: data?.error || 'Usuario o contraseña incorrectos.',
      };
    }

    return {
      ok: true,
      source: 'api',
      user: data.user,
    };
  } catch {
    return {
      ok: false,
      networkError: true,
      error:
        'No fue posible contactar el backend. En GitHub Pages use el acceso de prototipo; para usuarios reales ejecute la API conectada a Supabase.',
    };
  }
}
