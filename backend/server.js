console.log("top of server.js reached");

(async () => {
    try {
        console.log("Starting server.js");

        const path = require('path');
        if (process.env.NODE_ENV !== 'Production') {
            require('dotenv').config();
        }
        console.log("Loaded .env");

        const http = require('http');
        const url = require('url');
        console.log("Required core modules");

        const drinkRoutes = require('./routes/drinks');
        const authRoutes = require('./routes/auth');
        const userRoutes = require('./routes/user');
        const listsRoutes = require('./routes/lists');
        const adminRoutes = require('./routes/admin');
        const routes = [...drinkRoutes, ...authRoutes, ...userRoutes, ...listsRoutes, ...adminRoutes];

        const LOG_ENABLED = process.env.LOG_ENABLED === 'true';

        const server = http.createServer((req, res) => {
            const parsedUrl = url.parse(req.url, true);
            req.pathname = parsedUrl.pathname;
            req.query = parsedUrl.query;

            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
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

        const { sequelize, Drink } = require('./database');
        console.log("Loading populateDrinks.js");
        const populateDrinks = require('./populateDrinks');
        console.log("Loaded populateDrinks.js");

        await sequelize.authenticate();
        console.log("Connected to database");

        await sequelize.sync({ alter: true });
        console.log("Database synchronized");

        const drinkCount = await Drink.count();
        if (drinkCount === 0) {
            console.log("Drink table is empty. Populating...");
            await populateDrinks();
            console.log("Drink table populated");
        } else {
            console.log(`Drink table has ${drinkCount} entries. Skipping population.`);
        }

        const PORT = process.env.PORT || 8080;
        console.log("About to call server.listen");
        server.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Fatal startup error:", err.stack || err);
    }
})();
