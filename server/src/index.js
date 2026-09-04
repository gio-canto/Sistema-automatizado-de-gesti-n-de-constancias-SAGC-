import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { checkDatabaseConnection } from './config/db.js';

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
    console.error('Error de conexión con MySQL:', error);
    res.status(503).json({
      ok: false,
      error: 'No fue posible conectar con MySQL.',
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
      `MySQL conectado: ${info.database_name} · versión ${info.mysql_version}`
    );
  } catch {
    console.warn(
      'La API inició, pero MySQL todavía no está disponible. Ejecuta npm run db:check después de configurar server/.env.'
    );
  }
});
