import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
const root = process.cwd();
const types = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8' };
const server = createServer(async (request, response) => {
  const pathname = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  const file = normalize(join(root, pathname));
  if (!file.startsWith(root)) return response.writeHead(403).end('Forbidden');
  try { response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' }); response.end(await readFile(file)); }
  catch { response.writeHead(404).end('Not found'); }
});
server.listen(4173, () => console.log('AI Shopping Assistant: http://localhost:4173'));
