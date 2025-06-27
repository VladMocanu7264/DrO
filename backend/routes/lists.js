const { List, ListDrink, Drink } = require('../database');
const { withAuth } = require('../helpers');
const { Op } = require('sequelize');

const LOG_ENABLED = process.env.LOG_ENABLED === 'true';

function matchGetUserLists(req) {
    return req.pathname === '/lists' && req.method === 'GET';
}


async function handleGetUserLists(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            let userId = req.user.id;
            if (body) {
                const parsed = JSON.parse(body);
                if (parsed.userId) {
                    userId = parsed.userId;
                    const lists = await List.findAll({
                        where: { UserId: userId, public: true },
                        attributes: ['id', 'name', 'public']
                    });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify(lists));
                }
            }
            const lists = await List.findAll({
                where: { UserId: userId },
                attributes: ['id', 'name', 'public']
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(lists));
        } catch (err) {
            if (LOG_ENABLED) console.error('Get user lists error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
}

function matchGetList(req) {
    const match = req.pathname.match(/^\/lists\/(\d+)$/);
    if (match && req.method === 'GET') {
        return { params: { id: match[1] } };
    }
    return false;
}

async function handleGetList(req, res) {
    try {
        const list = await List.findOne({
            where: { id: req.params.id, UserId: req.user.id },
            include: {
                model: ListDrink,
                include: {
                    model: Drink,
                    attributes: ['id', 'name', 'image_url','nutrition_grade','quantity','brand', 'price']
                }
            }
        });
        if (!list) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'List not found' }));
        }

        const drinks = list.ListDrinks.map(ld => ({
            id: ld.Drink.id,
            name: ld.Drink.name,
            image_url: ld.Drink.image_url,
            nutrition_grade: ld.Drink.nutrition_grade,
            quantity: ld.Drink.quantity,
            brand: ld.Drink.brand,
            price: ld.Drink.price
        }));

        const result = {
            id: list.id,
            name: list.name,
            public: list.public,
            drinks
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    } catch (err) {
        if (LOG_ENABLED) console.error('Get list error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchPostList(req) {
    return req.pathname === '/lists' && req.method === 'POST';
}

async function handlePostList(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const { name, public: isPublic } = JSON.parse(body);
            if (!name) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Missing name' }));
            }
            const list = await List.create({ name, public: !!isPublic, UserId: req.user.id });
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'List created', id: list.id }));
        } catch (err) {
            if (LOG_ENABLED) console.error('Create list error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
}

function matchPatchList(req) {
    const match = req.pathname.match(/^\/lists\/(\d+)$/);
    if (match && req.method === 'PATCH') {
        return { params: { id: match[1] } };
    }
    return false;
}

async function handlePatchList(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const updates = JSON.parse(body);
            await List.update(updates, { where: { id: req.params.id, UserId: req.user.id } });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'List updated' }));
        } catch (err) {
            if (LOG_ENABLED) console.error('Patch list error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
}

function matchDeleteList(req) {
    const match = req.pathname.match(/^\/lists\/(\d+)$/);
    if (match && req.method === 'DELETE') {
        return { params: { id: match[1] } };
    }
    return false;
}

async function handleDeleteList(req, res) {
    try {
        await List.destroy({ where: { id: req.params.id, UserId: req.user.id } });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'List deleted' }));
    } catch (err) {
        if (LOG_ENABLED) console.error('Delete list error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}


function matchGetListsWithDrink(req) {
    const match = req.pathname.match(/^\/lists\/with-drink\/([a-zA-Z0-9]+)$/);
    if (match && req.method === 'GET') {
        return { params: { drinkId: match[1] } };
    }
    return false;
}

async function handleGetListsWithDrink(req, res) {
    try {
        const allLists = await List.findAll({
            where: { UserId: req.user.id },
            attributes: ['id', 'name'],
            include: {
                model: ListDrink,
                attributes: ['DrinkId']
            }
        });

        const included = [];
        const excluded = [];

        for (const list of allLists) {
            const hasDrink = list.ListDrinks.some(ld => ld.DrinkId === req.params.drinkId);
            if (hasDrink) included.push({ id: list.id, name: list.name });
            else excluded.push({ id: list.id, name: list.name });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ included, excluded }));
    } catch (err) {
        if (LOG_ENABLED) console.error('Get with-drink error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchPostListAdd(req) {
    const match = req.pathname.match(/^\/lists\/(\d+)\/add$/);
    if (match && req.method === 'POST') {
        return { params: { listId: match[1] } };
    }
    return false;
}

async function handlePostListAdd(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const { drinkId } = JSON.parse(body);
            if (!drinkId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Missing drinkId' }));
            }
            await ListDrink.findOrCreate({
                where: { ListId: req.params.listId, DrinkId: drinkId }
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Drink added to list' }));
        } catch (err) {
            if (LOG_ENABLED) console.error('List add error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
}

function matchDeleteListRemove(req) {
    const match = req.pathname.match(/^\/lists\/(\d+)\/remove$/);
    if (match && req.method === 'DELETE') {
        return { params: { listId: match[1] } };
    }
    return false;
}

async function handleDeleteListRemove(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const { drinkId } = JSON.parse(body);
            if (!drinkId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Missing drinkId' }));
            }
            await ListDrink.destroy({
                where: { ListId: req.params.listId, DrinkId: drinkId }
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Drink removed from list' }));
        } catch (err) {
            if (LOG_ENABLED) console.error('List remove error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
}

function matchCopyList(req) {
    const match = req.pathname.match(/^\/lists\/(\d+)\/copy$/);
    if (match && req.method === 'POST') {
        return { params: { listId: match[1] } };
    }
    return false;
}

async function handleCopyList(req, res) {
    try {
        const original = await List.findOne({
            where: { id: req.params.listId, public: true },
            include: {
                model: ListDrink,
                include: {
                    model: Drink,
                    attributes: ['id']
                }
            }
        });

        if (!original) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Public list not found' }));
        }

        const newList = await List.create({
            name: `${original.name} (copy)`,
            public: false,
            UserId: req.user.id
        });

        const drinkLinks = original.ListDrinks.map(ld => ({
            ListId: newList.id,
            DrinkId: ld.Drink.id
        }));

        await ListDrink.bulkCreate(drinkLinks);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'List copied successfully', id: newList.id }));
    } catch (err) {
        if (LOG_ENABLED) console.error('Copy list error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

module.exports = [
    { match: matchGetUserLists, handle: withAuth(handleGetUserLists) },
    { match: matchGetList, handle: withAuth(handleGetList) },
    { match: matchPostList, handle: withAuth(handlePostList) },
    { match: matchPatchList, handle: withAuth(handlePatchList) },
    { match: matchDeleteList, handle: withAuth(handleDeleteList) },
    { match: matchGetListsWithDrink, handle: withAuth(handleGetListsWithDrink) },
    { match: matchPostListAdd, handle: withAuth(handlePostListAdd) },
    { match: matchDeleteListRemove, handle: withAuth(handleDeleteListRemove) },
    { match: matchCopyList, handle: withAuth(handleCopyList) }
];
