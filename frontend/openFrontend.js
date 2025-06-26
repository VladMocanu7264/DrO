const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const mime = require('mime-types');
const open = (...args) => import('open').then(m => m.default(...args));

const PORT = 7264;
const FRONTEND_DIR = path.join(__dirname, '');

const server = http.createServer((req, res) => {
    let requestedPath = req.url.split('?')[0];
    if (requestedPath === '/') {
        requestedPath = '/entry'; // Default page
    }

    let filePath = path.join(FRONTEND_DIR, requestedPath);
    if (!path.extname(filePath)) {
        filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('404 Not Found');
        }

        const contentType = mime.lookup(filePath) || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });

        if (filePath.endsWith('.html')) {
            const injected = data.toString().replace(
                /<\/body>/i,
                `<script>
                    const ws = new WebSocket('ws://' + location.host);
                    ws.onmessage = (msg) => { if (msg.data === 'reload') location.reload(); };
                </script></body>`
            );
            return res.end(injected);
        }

        res.end(data);
    });
});

const wss = new WebSocket.Server({ server });

function broadcastReload() {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send('reload');
        }
    });
}

chokidar.watch(FRONTEND_DIR).on('change', (file) => {
    console.log(`File changed: ${file}`);
    broadcastReload();
});

server.listen(PORT, () => {
    console.log(`Live server running at http://localhost:${PORT}`);
    open(`http://localhost:${PORT}`); // auto-opens browser
});
