const { Drink, Tag, DrinkTag } = require('../database');
const LOG_ENABLED = process.env.LOG_ENABLED === 'true';

function matchGetDrinkById(req) {
    const match = req.pathname.match(/^\/drinks\/([0-9]+)$/);
    if (match && req.method === 'GET') {
        return { params: { id: match[1] } };
    }
    return false;
}

async function handleGetDrinkById(req, res) {
    const { id } = req.params;
    try {
        const drink = await Drink.findByPk(id, {
            include: {
                model: DrinkTag,
                include: {
                    model: Tag,
                    attributes: ['name']
                }
            }
        });

        if (!drink) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Drink not found' }));
        }

        const allTags = drink.DrinkTags.map(dt => dt.Tag.name);
        const category = allTags.find(tag => !tag.includes('-')) || null;
        const tags = allTags;

        const output = {
            id: drink.id,
            name: drink.name,
            brand: drink.brand,
            category,
            image_url: drink.image_url,
            nutrition_grade: drink.nutrition_grade,
            quantity: drink.quantity,
            packaging: drink.packaging,
            tags
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(output));
    } catch (error) {
        if (LOG_ENABLED) console.error('Error in handleGetDrinkById:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchGetFilters(req) {
    return req.pathname === '/drinks/filters' && req.method === 'GET';
}

async function handleGetFilters(req, res) {
    try {
        const tags = await Tag.findAll({ attributes: ['id', 'name'] });
        const response = {
            sortOptions: [
                { key: 'name', label: 'Name' },
                { key: 'brand', label: 'Brand' },
                { key: 'nutrition_grade', label: 'Nutrition Grade' }
            ],
            tags: tags
                .filter(t => !t.name.includes('-'))
                .map(t => ({ id: t.id, name: t.name }))
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
    } catch (error) {
        if (LOG_ENABLED) console.error('Error in handleGetFilters:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

module.exports = [
    { match: matchGetDrinkById, handle: handleGetDrinkById },
    { match: matchGetFilters, handle: handleGetFilters }
];
