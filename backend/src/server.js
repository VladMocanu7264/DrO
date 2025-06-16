try {
    console.log("Starting server.js");

    require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
    console.log("Loaded .env");

    const http = require('http');
    const url = require('url');

    console.log("Required core modules");

    const drinkRoutes = require('./routes/drinks');
    // const authRoutes = require('./routes/auth');
    // const userRoutes = require('./routes/user');
    const routes = [...drinkRoutes]; // Add the rest when ready

    const LOG_ENABLED = process.env.LOG_ENABLED === 'true';

    const server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url, true);
        req.pathname = parsedUrl.pathname;
        req.query = parsedUrl.query;

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

    const { sequelize, Drink } = require('./database');
    const populateDrinks = require('./populateDrinks');

    (async () => {
        try {
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
            server.listen(PORT, () => {
                console.log(`Server running at http://localhost:${PORT}`);
            });

        } catch (err) {
            console.error("Fatal DB/init error:", err);
        }
    })();

} catch (err) {
    console.error("Fatal startup error:", err);
}
