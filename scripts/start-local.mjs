import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');
const serverDir = path.join(root, 'server');
const frontendUrl = 'http://127.0.0.1:5173';
const backendUrl = 'http://127.0.0.1:3001';

function spawnProcess(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });

  child.on('error', (error) => {
    console.error(`\n[SAGC:${name}] Error original al iniciar el proceso:`);
    console.error(error);
  });

  child.on('exit', (code, signal) => {
    if (code && code !== 0) {
      console.error(
        `\n[SAGC:${name}] El proceso terminó con código ${code}. Revisa arriba la salida original de npm/Node/Vite.`
      );
    } else if (signal) {
      console.error(`\n[SAGC:${name}] El proceso terminó por señal ${signal}.`);
    }
  });

  return child;
}

function openBrowser(url) {
  let command;
  let args;

  if (process.platform === 'win32') {
    command = 'cmd';
    args = ['/c', 'start', '', url];
  } else if (process.platform === 'darwin') {
    command = 'open';
    args = [url];
  } else {
    command = 'xdg-open';
    args = [url];
  }

  const browser = spawn(command, args, {
    stdio: 'ignore',
    shell: false,
    detached: true,
  });
  browser.unref();
}

async function waitForUrl(url, timeoutMs = 30000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
      });

      if (response.ok) return true;
    } catch {
      // El proceso de Vite conserva su salida original en esta misma consola.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return false;
}

async function checkBackend() {
  try {
    const response = await fetch(`${backendUrl}/api/health`, { cache: 'no-store' });
    return response.ok;
  } catch {
    return false;
  }
}

const envFile = path.join(serverDir, '.env');

console.log('');
console.log('=======================================');
console.log(' SAGC · Lanzamiento local');
console.log('=======================================');
console.log(`Frontend esperado: ${frontendUrl}`);
console.log(`Backend esperado:  ${backendUrl}`);
console.log('');
console.log('La salida de npm, Node, Express y Vite se mostrará directamente.');
console.log('El lanzador no instalará ni reparará dependencias automáticamente.');
console.log('');

if (!existsSync(envFile)) {
  console.warn('[SAGC] ENOENT: no existe server/.env');
  console.warn(`       Ruta esperada: ${envFile}`);
  console.warn('       El backend puede fallar al iniciar; su error original aparecerá debajo.');
}

// No se comprueba node_modules antes de arrancar deliberadamente.
// Si falta una dependencia, npm/Node/Vite deben imprimir su error original.
const backend = spawnProcess('backend', 'npm', ['run', 'dev'], serverDir);
const frontend = spawnProcess(
  'frontend',
  'npm',
  ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort'],
  root
);

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('\nCerrando SAGC...');
  backend.kill();
  frontend.kill();
  setTimeout(() => process.exit(0), 300);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const frontendReady = await waitForUrl(frontendUrl);

if (!frontendReady) {
  console.error('');
  console.error('[SAGC] Vite no respondió en 30 segundos.');
  console.error('[SAGC] El error original del proceso debe aparecer arriba en esta misma consola.');
  shutdown();
} else {
  const backendReady = await checkBackend();
  console.log('');
  console.log('[SAGC] Frontend listo.');
  console.log(
    backendReady
      ? '[SAGC] Backend listo.'
      : '[SAGC] Backend no respondió. Revisa arriba su salida original de consola.'
  );
  console.log(`Abriendo ${frontendUrl} ...`);

  try {
    openBrowser(frontendUrl);
  } catch (error) {
    console.error('[SAGC] Error al abrir el navegador:');
    console.error(error);
    console.log(`Abre manualmente: ${frontendUrl}`);
  }
}