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

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] terminó con código ${code}.`);
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
      // El servidor todavía está arrancando.
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

const frontendModules = path.join(root, 'node_modules');
const backendModules = path.join(serverDir, 'node_modules');
const envFile = path.join(serverDir, '.env');

if (!existsSync(frontendModules) || !existsSync(backendModules)) {
  console.error('Faltan dependencias. Ejecuta primero: npm run setup:project');
  process.exit(1);
}

console.log('');
console.log('=======================================');
console.log(' SAGC · Lanzamiento local');
console.log('=======================================');
console.log(`Frontend esperado: ${frontendUrl}`);
console.log(`Backend esperado:  ${backendUrl}`);
console.log('');

if (!existsSync(envFile)) {
  console.warn('[AVISO] server/.env no existe.');
  console.warn('        demo/demo podrá funcionar, pero Supabase no estará disponible.');
}

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
  console.error('ERROR: Vite no respondió en http://127.0.0.1:5173 después de 30 segundos.');
  console.error('Revisa los mensajes anteriores de la terminal.');
  shutdown();
} else {
  const backendReady = await checkBackend();
  console.log('');
  console.log('[OK] Frontend listo.');
  console.log(backendReady ? '[OK] Backend listo.' : '[AVISO] Backend no disponible todavía; demo/demo sigue utilizable.');
  console.log(`Abriendo ${frontendUrl} ...`);

  try {
    openBrowser(frontendUrl);
  } catch {
    console.log(`Abre manualmente: ${frontendUrl}`);
  }
}