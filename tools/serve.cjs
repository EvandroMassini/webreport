/** Criado pela IA para a distribuição: servidor estático de desenvolvimento. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.csv': 'text/csv', '.md': 'text/plain' };
function createServer() {
  return http.createServer((req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!file.startsWith(root + path.sep) || !['GET', 'HEAD'].includes(req.method)) {
        res.writeHead(403).end(); return;
      }
      fs.readFile(file, (error, data) => {
        if (error) { res.writeHead(404).end('Não encontrado'); return; }
        res.writeHead(200, { 'Content-Type': (types[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(req.method === 'HEAD' ? undefined : data);
      });
    } catch { res.writeHead(400).end(); }
  });
}
module.exports = { createServer };
if (require.main === module) {
  const port = Number(process.env.PORT || 8080);
  createServer().listen(port, '127.0.0.1', () => console.log(`WebReport: http://127.0.0.1:${port}`));
}
