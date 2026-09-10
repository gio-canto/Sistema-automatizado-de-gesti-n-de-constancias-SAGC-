import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');
const server = path.join(root, 'server');

function npmDependenciesAreHealthy(directory) {
  if (!existsSync(path.join(directory, 'node_modules'))) {
    return false;
  }

  const result = spawnSync('npm', ['ls', '--depth=0', '--silent'], {
    cwd: directory,
    stdio: 'ignore',
    shell: process.platform === 'win32',
  });

  return result.status === 0;
}

function showNpmProblem(directory) {
  spawnSync('npm', ['ls', '--depth=0'], {
    cwd: directory,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
}

function checkDependencies(label, directory, installCommand) {
  console.log(`[--] ${label}: comprobando dependencias...`);

  if (npmDependenciesAreHealthy(directory)) {
    console.log(`[OK] ${label}: dependencias correctas.`);
    return true;
  }

  console.error(`\n[ERROR] ${label}: las dependencias no están completas o son incompatibles.`);

  if (!existsSync(path.join(directory, 'node_modules'))) {
    console.error('        No existe node_modules.');
  } else {
    console.error('        Detalle original de npm:');
    showNpmProblem(directory);
  }

  console.error(`        No se realizará ninguna reinstalación automática.`);
  console.error(`        Cuando quieras corregirlo manualmente ejecuta: ${installCommand}\n`);
  return false;
}

const nodeMajor = Number(process.versions.node.split('.')[0]);

console.log('');
console.log('=== SAGC · Diagnóstico del proyecto ===');
console.log(`Node.js detectado: ${process.version}`);

if (nodeMajor < 20) {
  console.error(
    `[ERROR] SAGC requiere Node.js 20 o superior. Versión actual: ${process.version}`
  );
  process.exit(1);
}

const frontendOk = checkDependencies('Frontend', root, 'npm install');
const backendOk = checkDependencies(
  'Backend',
  server,
  'npm --prefix server install'
);

const envFile = path.join(server, '.env');
let envOk = true;

if (existsSync(envFile)) {
  console.log('[OK] Backend: server/.env existe.');
} else {
  envOk = false;
  console.error('[ERROR] Backend: falta server/.env.');
  console.error('        El diagnóstico no lo creará automáticamente.');
  console.error(
    '        Créalo manualmente a partir de server/.env.example y configura Supabase.\n'
  );
}

console.log('');

if (!frontendOk || !backendOk || !envOk) {
  console.error('Diagnóstico terminado con problemas. No se modificó ningún archivo ni dependencia.');
  process.exit(1);
}

console.log('Diagnóstico correcto. No se instaló ni modificó nada.');
console.log('Puedes continuar con npm start.');
