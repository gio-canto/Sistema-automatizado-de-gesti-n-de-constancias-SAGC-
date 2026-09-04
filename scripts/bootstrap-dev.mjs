import { copyFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');

function run(command, args, cwd) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const major = Number(process.versions.node.split('.')[0]);

if (major < 20) {
  console.error(`SAGC requiere Node.js 20 o superior. Versión actual: ${process.version}`);
  process.exit(1);
}

console.log('SAGC · Preparando proyecto local');
console.log(`Node.js: ${process.version}`);

run('npm', ['install'], root);
run('npm', ['install'], path.join(root, 'server'));

const envExample = path.join(root, 'server', '.env.example');
const envFile = path.join(root, 'server', '.env');

if (!existsSync(envFile)) {
  copyFileSync(envExample, envFile);
  console.log('\nCreado server/.env desde server/.env.example.');
  console.log('Edita DB_PASSWORD y las demás variables antes de iniciar el backend.');
} else {
  console.log('\nserver/.env ya existe; no se modificó.');
}

console.log('\nPreparación de dependencias terminada.');
console.log('Siguiente paso: configurar MySQL y ejecutar npm run db:check.');
