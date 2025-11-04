const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  // Sanitizar la URL y obtener el path
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(PUBLIC_DIR, filePath);

  // Verificar que el archivo esté dentro de PUBLIC_DIR (seguridad)
  const normalizedPath = path.normalize(filePath);
  if (!normalizedPath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Obtener la extensión del archivo
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Leer y servir el archivo
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('404 - Archivo no encontrado');
      } else {
        res.writeHead(500);
        res.end(`Error del servidor: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║   🚀 Servidor local iniciado exitosamente!        ║
║                                                    ║
║   📂 Sirviendo: ${PUBLIC_DIR}                     ║
║   🌐 URL: http://localhost:${PORT}                    ║
║                                                    ║
║   Presiona Ctrl+C para detener el servidor        ║
║                                                    ║
╚════════════════════════════════════════════════════╝
`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Error: El puerto ${PORT} ya está en uso.`);
    console.error('   Intenta cerrar otros servidores o usa otro puerto.');
  } else {
    console.error('❌ Error del servidor:', err);
  }
  process.exit(1);
});
