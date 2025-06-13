require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const http = require('http');
const url = require('url');

const drinkRoutes = require('./routes/drinks');
const routes = [...drinkRoutes];

const LOG_ENABLED = process.env.LOG_ENABLED === 'true';

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    req.pathname = parsedUrl.pathname;
    req.query = parsedUrl.query;

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

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});