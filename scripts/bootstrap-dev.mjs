import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');
const server = path.join(root, 'server');

function checkDependencies(label, directory) {
  console.log('');
  console.log(`=== ${label} · npm ls --depth=0 ===`);

  // Se ejecuta una sola vez y con stdio heredado para conservar exactamente
  // stdout/stderr de npm: warnings, npm ERR!, rutas, códigos y stack traces.
  const result = spawnSync('npm', ['ls', '--depth=0'], {
    cwd: directory,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error) {
    console.error('');
    console.error(`[SAGC] No fue posible ejecutar npm para ${label}.`);
    console.error(result.error);
    return false;
  }

  if (result.status !== 0) {
    console.error('');
    console.error(
      `[SAGC] ${label}: npm terminó con código ${result.status}. No se modificó ni reinstaló nada.`
    );
    return false;
  }

  console.log(`[SAGC] ${label}: comprobación finalizada sin errores.`);
  return true;
}

const nodeMajor = Number(process.versions.node.split('.')[0]);

console.log('');
console.log('=== SAGC · Diagnóstico del proyecto ===');
console.log(`Node.js detectado: ${process.version}`);
console.log(`npm se ejecutará con la salida original de la consola.`);

if (nodeMajor < 20) {
  console.error('');
  console.error(
    `[SAGC] Node.js no cumple el requisito mínimo. Versión actual: ${process.version}`
  );
  process.exit(1);
}

const frontendOk = checkDependencies('Frontend', root);
const backendOk = checkDependencies('Backend', server);

const envFile = path.join(server, '.env');
let envOk = true;

console.log('');
console.log('=== Backend · server/.env ===');

if (existsSync(envFile)) {
  console.log('[SAGC] server/.env existe.');
} else {
  envOk = false;
  console.error('[SAGC] ENOENT: no existe server/.env');
  console.error(`        Ruta esperada: ${envFile}`);
  console.error('        No se creará automáticamente.');
}

console.log('');

if (!frontendOk || !backendOk || !envOk) {
  console.error('[SAGC] Diagnóstico terminado con errores.');
  console.error('[SAGC] No se modificó ningún archivo ni dependencia.');
  process.exit(1);
}

console.log('[SAGC] Diagnóstico correcto. No se instaló ni modificó nada.');