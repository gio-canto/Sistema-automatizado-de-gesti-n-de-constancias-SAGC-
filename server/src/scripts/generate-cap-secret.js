import { randomBytes } from 'node:crypto';

const secret = randomBytes(32).toString('base64url');

console.log('CAP_SECRET=' + secret);
console.log('');
console.log('Copie esta línea a server/.env. No la publique ni la coloque en Vite.');
