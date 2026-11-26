// Minimal static server for the household budget site (Node 22, stdlib only).
// Serves app/ at the server root, so app/index.html opens at /.
//
//   node serve.ts            serves http://localhost:8080
//   node serve.ts --port 9000
//
// Only files under app/ are served; anything else is a 404.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = resolve(join(fileURLToPath(new URL('.', import.meta.url)), 'app'));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function portFromArgs(argv) {
  const flag = argv.indexOf('--port');
  if (flag >= 0 && argv[flag + 1]) {
    const value = Number(argv[flag + 1]);
    if (Number.isInteger(value) && value > 0 && value < 65536) return value;
  }
  return 8080;
}

const port = portFromArgs(process.argv.slice(2));

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let path = decodeURIComponent(url.pathname);
    if (path === '/') path = '/index.html';
    const file = resolve(join(appDir, normalize(path)));
    if (!file.startsWith(appDir + '/') && file !== appDir) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Hartono Household Budget serving app/ at http://localhost:${port}`);
});
