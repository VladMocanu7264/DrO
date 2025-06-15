require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const http = require('http');
const url = require('url');

const drinkRoutes = require('./routes/drinks');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const routes = [...drinkRoutes, ...authRoutes, ...userRoutes];

const LOG_ENABLED = process.env.LOG_ENABLED === 'true';

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    req.pathname = parsedUrl.pathname;
    req.query = parsedUrl.query;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    if (LOG_ENABLED) console.log(`[${req.method}] ${req.pathname}`);

    for (const route of routes) {
        const match = route.match(req);
        if (match) {
            req.params = match.params || {};
            return route.handle(req, res);
        }
    }

    if (LOG_ENABLED) console.warn(`404 Not Found: ${req.pathname}`);

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
