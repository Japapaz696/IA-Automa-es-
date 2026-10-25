const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const prefix = '/IA-Automa-es-';
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
function createServer() {
  return http.createServer((req, res) => {
    let url;
    try { url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400).end(); return; }
    if (url === prefix) { res.writeHead(302, { Location: prefix + '/' }).end(); return; }
    if (url.startsWith(prefix + '/')) url = url.slice(prefix.length);
    const file = path.resolve(root, '.' + (url.endsWith('/') ? url + 'index.html' : url));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    fs.readFile(file, (err, bytes) => {
      if (err) { res.writeHead(404).end(); return; }
      res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
      res.end(bytes);
    });
  });
}
module.exports = { createServer };
if (require.main === module) createServer().listen(8086, '127.0.0.1', () => console.log('http://127.0.0.1:8086/IA-Automa-es-/'));
