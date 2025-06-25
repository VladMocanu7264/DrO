const { User, Group, Drink, Tag, DrinkTag } = require('../database');
const { verifyJWT } = require('../helpers');
const { Op } = require('sequelize');

function withAdminAuth(handler) {
    return async (req, res) => {
        const result = verifyJWT(req);
        if (result.error) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: result.error }));
        }
        if (!result.user.is_admin) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Admin privileges required' }));
        }
        req.user = result.user;
        return handler(req, res);
    };
}

function matchGetAdminUsers(req) {
    return req.pathname === '/admin/users' && req.method === 'GET';
}

async function handleGetAdminUsers(req, res) {
    try {
        const term = req.query.search || '';
        const users = await User.findAll({
            where: {
                username: { [Op.iLike]: `%${term}%` }
            },
            attributes: ['id', 'username', 'email']
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchGetAdminGroups(req) {
    return req.pathname === '/admin/groups' && req.method === 'GET';
}

async function handleGetAdminGroups(req, res) {
    try {
        const term = req.query.search || '';
        const groups = await Group.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${term}%` } },
                    { description: { [Op.iLike]: `%${term}%` } }
                ]
            },
            attributes: ['id', 'name', 'description']
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(groups));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchGetAdminDrinks(req) {
    return req.pathname === '/admin/drinks' && req.method === 'GET';
}

async function handleGetAdminDrinks(req, res) {
    try {
        const term = req.query.search || '';
        const drinks = await Drink.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${term}%` } },
                    { brand: { [Op.iLike]: `%${term}%` } }
                ]
            },
            attributes: ['id', 'name', 'brand']
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(drinks));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchPostAdminDrink(req) {
    return req.pathname === '/admin/drinks' && req.method === 'POST';
}

async function handlePostAdminDrink(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const { id, name, brand, image_url, nutrition_grade, quantity, packaging, tags } = JSON.parse(body);

            if (!id || !name || !quantity) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Missing required fields' }));
            }

            const drink = await Drink.create({ id, name, brand, image_url, nutrition_grade, quantity, packaging });

            if (tags && Array.isArray(tags)) {
                for (const tag of tags) {
                    const [tagRecord] = await Tag.findOrCreate({ where: { name: tag } });
                    await DrinkTag.create({ DrinkId: drink.id, TagId: tagRecord.id });
                }
            }

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Drink added' }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
}

function matchDeleteAdminUser(req) {
    const match = req.pathname.match(/^\/admin\/users\/(.+)$/);
    if (match && req.method === 'DELETE') return { params: { userId: match[1] } };
    return false;
}

async function handleDeleteAdminUser(req, res) {
    try {
        await User.destroy({ where: { id: req.params.userId } });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User deleted' }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchDeleteAdminGroup(req) {
    const match = req.pathname.match(/^\/admin\/groups\/(.+)$/);
    if (match && req.method === 'DELETE') return { params: { groupId: match[1] } };
    return false;
}

async function handleDeleteAdminGroup(req, res) {
    try {
        await Group.destroy({ where: { id: req.params.groupId } });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Group deleted' }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchDeleteAdminDrink(req) {
    const match = req.pathname.match(/^\/admin\/drinks\/(.+)$/);
    if (match && req.method === 'DELETE') return { params: { drinkId: match[1] } };
    return false;
}

async function handleDeleteAdminDrink(req, res) {
    try {
        await Drink.destroy({ where: { id: req.params.drinkId } });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Drink deleted' }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

module.exports = [
    { match: matchGetAdminUsers, handle: withAdminAuth(handleGetAdminUsers) },
    { match: matchGetAdminGroups, handle: withAdminAuth(handleGetAdminGroups) },
    { match: matchGetAdminDrinks, handle: withAdminAuth(handleGetAdminDrinks) },
    { match: matchPostAdminDrink, handle: withAdminAuth(handlePostAdminDrink) },
    { match: matchDeleteAdminUser, handle: withAdminAuth(handleDeleteAdminUser) },
    { match: matchDeleteAdminGroup, handle: withAdminAuth(handleDeleteAdminGroup) },
    { match: matchDeleteAdminDrink, handle: withAdminAuth(handleDeleteAdminDrink) }
];
