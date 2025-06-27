const { sequelize, Drink, Tag, DrinkTag, Favorite } = require('../database');
const { isRelevantTag, withAuth } = require('../helpers');
const { Op, fn, col, literal } = require('sequelize');

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
    const userId = req.user?.id;

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

        const allTags = drink.DrinkTags.map(dt => dt.Tag.name).filter(isRelevantTag);
        const category = allTags[0] || null;

        let isFavorite = false;
        if (userId) {
            const fav = await Favorite.findOne({
                where: { UserId: userId, DrinkId: id }
            });
            if (fav !== null && fav !== undefined) {
                isFavorite = true;
            }
        }

        const output = {
            id: drink.id,
            name: drink.name,
            brand: drink.brand,
            category,
            image_url: drink.image_url,
            nutrition_grade: drink.nutrition_grade,
            quantity: drink.quantity,
            packaging: drink.packaging,
            price: drink.price,
            tags: allTags,
            favorited: isFavorite
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(output));
    } catch (error) {
        if (LOG_ENABLED) console.error('Error in handleGetDrinkById:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchGetFeed(req) {
    return req.pathname === '/drinks/feed' && req.method === 'GET';
}

async function handleGetFeed(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const sort = req.query.sort || 'name';
        const tags = req.query.tags ? req.query.tags.split(',') : null;
        const grades = req.query.nutrition_grades ? req.query.nutrition_grades.split(',') : null;
        const search = req.query.search || null;
        const minQty = req.query.min_quantity ? parseInt(req.query.min_quantity) : null;
        const maxQty = req.query.max_quantity ? parseInt(req.query.max_quantity) : null;

        const allowedSorts = ['name', '-name', 'brand', '-brand', 'nutrition_grade', '-nutrition_grade', 'price', '-price'];

        let sortKey = 'name';
        let sortDirection = 'ASC';

        if (allowedSorts.includes(sort)) {
            if (sort.startsWith('-')) {
                sortKey = sort.substring(1);
                sortDirection = 'DESC';
            } else {
                sortKey = sort;
                sortDirection = 'ASC';
            }
        }

        const order = [[sortKey, sortDirection]];

        const where = {};

        if (grades) {
            where.nutrition_grade = { [Op.in]: grades.map(g => g.toLowerCase()) };
        }

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { brand: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (minQty !== null || maxQty !== null) {
            where.quantity = {};
            if (minQty !== null) where.quantity[Op.gte] = minQty;
            if (maxQty !== null) where.quantity[Op.lte] = maxQty;
        }

        const include = [
            {
                model: DrinkTag,
                required: false,
                include: [
                    {
                        model: Tag,
                        required: false
                    }
                ]
            }
        ];

        if (tags) {
            include[0].required = true;
            include[0].include[0].required = true;
            include[0].include[0].where = {
                [Op.or]: [
                    { name: { [Op.in]: tags } },
                    { id: { [Op.in]: tags.filter(t => !isNaN(t)).map(t => parseInt(t)) } }
                ]
            };
        }

        const allMatching = await Drink.findAll({
            where,
            include,
            order
        });

        const total = allMatching.length;
        const drinks = allMatching.slice(offset, offset + limit);

        const result = drinks.map(drink => ({
            id: drink.id,
            name: drink.name,
            brand: drink.brand,
            image_url: drink.image_url,
            nutrition_grade: drink.nutrition_grade,
            quantity: drink.quantity,
            packaging: drink.packaging,
            price: drink.price,
            tags: (drink.DrinkTags || []).map(dt => dt.Tag?.id).filter(id => id !== undefined)
        }));

        console.log(Math.ceil(total / limit), total, limit);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            max_pages: Math.ceil(total / limit),
            drinks: result
        }));
    } catch (err) {
        if (LOG_ENABLED) console.error('Feed error:', err);
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
        const grades = await Drink.findAll({
            attributes: [[fn('DISTINCT', col('nutrition_grade')), 'nutrition_grade']],
            raw: true
        });
        const quantities = await Drink.findOne({
            attributes: [
                [fn('MIN', col('quantity')), 'min_quantity'],
                [fn('MAX', col('quantity')), 'max_quantity']
            ],
            raw: true
        });

        const response = {
            sortOptions: [
                { key: 'name', label: 'Name (A–Z)' },
                { key: '-name', label: 'Name (Z–A)' },
                { key: 'brand', label: 'Brand (A–Z)' },
                { key: '-brand', label: 'Brand (Z–A)' },
                { key: 'nutrition_grade', label: 'Nutrition Grade (A–Z)' },
                { key: '-nutrition_grade', label: 'Nutrition Grade (Z–A)' },
                { key: 'price', label: 'Price (Low to High)' },
                { key: '-price', label: 'Price (High to Low)' }
            ],
            tags: tags
                .filter(tag => isRelevantTag(tag.name))
                .map(t => ({ id: t.id, name: t.name })),
            nutrition_grades: grades
                .map(g => g.nutrition_grade)
                .filter(Boolean)
                .sort((a, b) => a.localeCompare(b)),
            quantity: quantities || { min_quantity: 0, max_quantity: 0 }
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
    } catch (error) {
        if (LOG_ENABLED) console.error('Error in handleGetFilters:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchGetFavorites(req) {
    return req.pathname === '/favorites' && req.method === 'GET';
}

async function handleGetFavorites(req, res) {
    try {
        const favorites = await Favorite.findAll({
            where: { UserId: req.user.id },
            include: {
                model: Drink,
                attributes: ['id', 'name', 'brand', 'image_url', 'nutrition_grade', 'quantity', 'packaging', 'price']
            }
        });

        const result = favorites.map(fav => fav.Drink);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    } catch (error) {
        if (LOG_ENABLED) console.error('Error in handleGetFavorites:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchPostFavorite(req) {
    return req.pathname === '/favorites' && req.method === 'POST';
}

async function handlePostFavorite(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const { drinkId } = JSON.parse(body);
            if (!drinkId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Missing drinkId' }));
            }

            const drink = await Drink.findByPk(drinkId);
            if (!drink) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Drink not found' }));
            }

            const [fav, created] = await Favorite.findOrCreate({
                where: { UserId: req.user.id, DrinkId: drinkId }
            });

            if (!created) {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'The drink is already in favorites' }));
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Added to favorites' }));
        } catch (err) {
            if (LOG_ENABLED) console.error('Post favorite error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
}

function matchDeleteFavorite(req) {
    const match = req.pathname.match(/^\/favorites\/([a-zA-Z0-9]+)$/);
    if (match && req.method === 'DELETE') {
        return { params: { drinkId: match[1] } };
    }
    return false;
}

async function handleDeleteFavorite(req, res) {
    try {
        const deleted = await Favorite.destroy({
            where: { UserId: req.user.id, DrinkId: req.params.drinkId }
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Removed from favorites' }));
    } catch (err) {
        if (LOG_ENABLED) console.error('Delete favorite error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchGetDrinkRanking(req) {
    return req.pathname === "/drinks/ranking" && req.method === 'GET';
}

async function handleGetDrinkRanking(req, res) {
    const limit = parseInt(req.query.limit) || 10;

    try {
        const results = await sequelize.query(`
            SELECT
                d.id,
                d.name,
                d.brand,
                d.image_url,
                d.quantity,
                d.nutrition_grade,
                d.price,
                COUNT(f."id") AS "favoritesCount"
            FROM "Drinks" d
            LEFT JOIN "Favorites" f ON d.id = f."DrinkId"
            GROUP BY d.id
            ORDER BY "favoritesCount" DESC
            LIMIT :limit
        `, {
            replacements: { limit },
            type: sequelize.QueryTypes.SELECT
        });

        const drinksWithTags = await Promise.all(results.map(async (drink) => {
            const tags = await DrinkTag.findAll({
                where: { DrinkId: drink.id },
                include: {
                    model: Tag,
                    attributes: ['id']
                }
            });

            const tagIds = tags.map(dt => dt.Tag.id);

            return {
                id: drink.id,
                name: drink.name,
                brand: drink.brand,
                image_url: drink.image_url,
                nutrition_grade: drink.nutrition_grade,
                quantity: drink.quantity,
                price: parseFloat(drink.price),
                favoritesCount: parseInt(drink.favoritesCount),
                tags: tagIds
            };
        }));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(drinksWithTags));
    } catch (error) {
        if (process.env.LOG_ENABLED === 'true') {
            console.error("Error in /drinks/ranking:", error);
        }
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Internal server error" }));
    }
}

function matchGetIsFavorite(req) {
    const match = req.pathname.match(/^\/drinks\/([0-9]+)\/favorite$/);
    if (match && req.method === 'GET') {
        return { params: { drinkId: match[1] } };
    }
    return false;
}

async function handleGetIsFavorite(req, res) {
    const drinkId = req.params.drinkId;
    const userId = req.user?.id;

    if (!userId) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ favorited: false }));
    }

    try {
        const fav = await Favorite.findOne({
            where: { UserId: userId, DrinkId: drinkId }
        });
        const isFavorite = Boolean(fav);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ favorited: isFavorite }));
    } catch (err) {
        if (LOG_ENABLED) console.error('Error in handleGetIsFavorite:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

module.exports = [
    { match: matchGetDrinkById, handle: withAuth(handleGetDrinkById) },
    { match: matchGetFilters, handle: handleGetFilters },
    { match: matchGetFeed, handle: withAuth(handleGetFeed) },
    { match: matchGetFavorites, handle: withAuth(handleGetFavorites) },
    { match: matchPostFavorite, handle: withAuth(handlePostFavorite) },
    { match: matchDeleteFavorite, handle: withAuth(handleDeleteFavorite) },
    { match: matchGetDrinkRanking, handle: withAuth(handleGetDrinkRanking) },
    { match: matchGetIsFavorite, handle: withAuth(handleGetIsFavorite) }

];