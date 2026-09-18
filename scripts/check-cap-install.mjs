import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const requireFromServer = createRequire(
  new URL('../server/package.json', import.meta.url)
);

try {
  requireFromServer.resolve('capjs-core');
} catch {
  console.error('');
  console.error('CAP no puede comprobarse porque falta la dependencia capjs-core.');
  console.error('');
  console.error('Ejecute desde la raíz del proyecto:');
  console.error('');
  console.error('  npm install');
  console.error('');
  console.error('Si npm no la instala por algún motivo:');
  console.error('');
  console.error('  npm install capjs-core@0.1.1 --workspace sagc-api');
  console.error('');
  process.exit(1);
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const result = spawnSync(
  npmCommand,
  ['--workspace', 'sagc-api', 'run', 'cap:check:runtime'],
  {
    stdio: 'inherit',
    shell: false,
  }
);

process.exit(result.status ?? 1);
