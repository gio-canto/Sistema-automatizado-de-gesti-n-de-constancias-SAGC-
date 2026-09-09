import { copyFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');

function run(command, args, cwd) {
  console.log('\n> ' + command + ' ' + args.join(' '));
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function dependenciesAreHealthy(directory) {
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

function ensureDependencies(label, directory) {
  console.log('[--] ' + label + ': comprobando dependencias...');

  if (dependenciesAreHealthy(directory)) {
    console.log(
      '[OK] ' + label + ': dependencias completas y compatibles; se omite npm install.'
    );
    return;
  }

  console.log(
    '[--] ' + label + ': faltan dependencias o cambió package.json; ejecutando npm install...'
  );
  run('npm', ['install'], directory);

  if (!dependenciesAreHealthy(directory)) {
    console.error(
      '[ERROR] ' + label + ': npm install terminó, pero las dependencias siguen incompletas.'
    );
    process.exit(1);
  }

  console.log('[OK] ' + label + ': dependencias actualizadas.');
}

const major = Number(process.versions.node.split('.')[0]);

if (major < 20) {
  console.error(
    'SAGC requiere Node.js 20 o superior. Versión actual: ' + process.version
  );
  process.exit(1);
}

console.log('');
console.log('=== SAGC · Preparación inteligente del proyecto ===');
console.log('Node.js detectado: ' + process.version);

ensureDependencies('Frontend', root);
ensureDependencies('Backend', path.join(root, 'server'));

const envExample = path.join(root, 'server', '.env.example');
const envFile = path.join(root, 'server', '.env');

if (existsSync(envFile)) {
  console.log('[OK] server/.env ya existe; se conserva y se omite su creación.');
} else {
  copyFileSync(envExample, envFile);
  console.log('[OK] server/.env creado desde server/.env.example.');
  console.log(
    '     Edita SUPABASE_URL y SUPABASE_SECRET_KEY antes de iniciar el backend.'
  );
}

console.log('');
console.log('Preparación terminada.');
console.log(
  'Siguiente paso: configurar Supabase en server/.env y ejecutar npm run db:check.'
);
