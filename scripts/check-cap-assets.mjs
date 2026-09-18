import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const files = {
  widget: resolve('public/vendor/cap/cap.min.js'),
  wasm: resolve('public/vendor/cap/cap_wasm_bg.wasm'),
  pako: resolve('public/vendor/cap/pako_inflate.min.js'),
  license: resolve('public/vendor/cap/LICENSE'),
};

for (const [name, file] of Object.entries(files)) {
  const info = await stat(file);
  if (!info.isFile() || info.size < 8) {
    throw new Error(`Asset Cap inválido: ${name} (${file})`);
  }
}

const widget = await readFile(files.widget, 'utf8');
if (!widget.includes('customElements.define("cap-widget"')) {
  throw new Error('El widget local de Cap no registra cap-widget.');
}
if (!widget.includes('0.0.7/browser/cap_wasm_bg.wasm')) {
  throw new Error('La versión vendorizada del widget no coincide con el WASM esperado.');
}

const wasm = await readFile(files.wasm);
if (
  wasm[0] !== 0x00 ||
  wasm[1] !== 0x61 ||
  wasm[2] !== 0x73 ||
  wasm[3] !== 0x6d
) {
  throw new Error('cap_wasm_bg.wasm no contiene la cabecera WebAssembly válida.');
}

if (wasm.length !== 36032) {
  throw new Error(
    `cap_wasm_bg.wasm no corresponde exactamente a @cap.js/wasm 0.0.7 (36032 bytes). Recibidos: ${wasm.length}.`
  );
}

const pako = await readFile(files.pako, 'utf8');
if (!pako.includes('pako 2.1.0')) {
  throw new Error('El fallback pako local no corresponde a la versión esperada.');
}

console.log('Assets Cap correctos · widget 0.1.57 + WASM 0.0.7 + pako 2.1.0.');
