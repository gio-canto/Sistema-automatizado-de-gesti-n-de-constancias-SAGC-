import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import argon2 from 'argon2';
import {
  checkDatabaseConnection,
  supabase,
} from './config/supabase.js';

const app = express();
const port = Number(process.env.PORT || 3001);

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'sagc-api',
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/health/db', async (_req, res) => {
  try {
    const database = await checkDatabaseConnection();
    res.json({ ok: true, database });
  } catch (error) {
    console.error('Error de conexión con Supabase/PostgreSQL:', error);
    res.status(503).json({
      ok: false,
      error: 'No fue posible conectar con Supabase/PostgreSQL.',
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const user = String(req.body?.user || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!user || !password) {
    return res.status(400).json({
      ok: false,
      error: 'Ingrese su usuario y contraseña.',
    });
  }

  try {
    const { data: account, error } = await supabase
      .from('usuarios')
      .select(
        'id_usuario,nombre,usuario,password_hash,permiso,activo'
      )
      .eq('usuario', user)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!account || !account.activo) {
      return res.status(401).json({
        ok: false,
        error: 'Usuario o contraseña incorrectos.',
      });
    }

    const validPassword = await argon2.verify(
      account.password_hash,
      password
    );

    if (!validPassword) {
      return res.status(401).json({
        ok: false,
        error: 'Usuario o contraseña incorrectos.',
      });
    }

    return res.json({
      ok: true,
      user: {
        id: account.id_usuario,
        nombre: account.nombre,
        usuario: account.usuario,
        permiso: account.permiso,
      },
    });
  } catch (error) {
    console.error('Error durante autenticación:', error);
    return res.status(503).json({
      ok: false,
      error: 'El servicio de autenticación no está disponible.',
    });
  }
});

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'Ruta no encontrada.' });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
});

app.listen(port, async () => {
  console.log(`SAGC API disponible en http://localhost:${port}`);

  try {
    const info = await checkDatabaseConnection();
    console.log(
      `Supabase conectado · PostgreSQL · esquema ${info?.schema || 'public'}`
    );
  } catch {
    console.warn(
      'La API inició, pero Supabase todavía no está disponible. Configura server/.env y ejecuta npm run db:check.'
    );
  }
});
