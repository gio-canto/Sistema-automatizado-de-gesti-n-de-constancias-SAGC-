import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');
const serverDir = path.join(root, 'server');

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
console.log('Frontend: http://localhost:5173');
console.log('Backend:  http://localhost:3001');
console.log('');

if (!existsSync(envFile)) {
  console.warn('[AVISO] server/.env no existe.');
  console.warn('        El frontend y demo/demo pueden iniciar, pero MySQL no estará disponible.');
}

const backend = spawnProcess('backend', 'npm', ['run', 'dev'], serverDir);
const frontend = spawnProcess('frontend', 'npm', ['run', 'dev', '--', '--host', '127.0.0.1'], root);

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

setTimeout(() => {
  try {
    openBrowser('http://localhost:5173');
    console.log('Navegador abierto en http://localhost:5173');
  } catch {
    console.log('Abre manualmente: http://localhost:5173');
  }
}, 1800);
