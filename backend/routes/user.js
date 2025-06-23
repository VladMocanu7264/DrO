const { User, List, ListDrink, Drink } = require('../database');
const { withAuth, isValidEmail, isValidUsername } = require('../helpers');
const bcrypt = require('bcrypt');
const Busboy = require('busboy');
const fs = require('fs');
const path = require('path');

const LOG_ENABLED = process.env.LOG_ENABLED === 'true';

function matchDeleteMe(req) {
    return req.pathname === '/users/me' && req.method === 'DELETE';
}

async function handleDeleteMe(req, res) {
    try {
        const deleted = await User.destroy({ where: { id: req.user.id } });
        if (deleted === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'User not found' }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Account deleted' }));
    } catch (err) {
        if (LOG_ENABLED) console.error('Delete error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchGetUser(req) {
    const match = req.pathname.match(/^\/users\/([a-zA-Z0-9_]{3,20})$/);
    if (match && req.method === 'GET') {
        return { params: { username: match[1] } };
    }
    return false;
}

async function handleGetUser(req, res) {
    try {
        const user = await User.findOne({
            where: { username: req.params.username },
            attributes: ['username', 'description', 'image_path'],
            include: {
                model: List,
                where: { public: true },
                required: false,
                include: {
                    model: ListDrink,
                    include: {
                        model: Drink,
                        attributes: ['id', 'name', 'image_url']
                    }
                }
            }
        });

        if (!user) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'User not found' }));
        }

        const lists = user.Lists.map(list => ({
            id: list.id,
            name: list.name,
            drinks: list.ListDrinks.map(ld => ld.Drink)
        }));

        const result = {
            username: user.username,
            email: 'hidden',
            description: user.description,
            image_path: user.image_path,
            lists
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    } catch (err) {
        if (LOG_ENABLED) console.error('Get user error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchPatchMe(req) {
    return req.pathname === '/users/me' && req.method === 'PATCH';
}

function handlePatchMe(req, res) {
    const busboy = new Busboy({ headers: req.headers });
    const updates = {};
    let uploadPath = null;

    busboy.on('field', (fieldname, val) => {
        if (fieldname === 'username' && isValidUsername(val)) updates.username = val;
        if (fieldname === 'description') updates.description = val;
    });

    busboy.on('file', (fieldname, file, filename) => {
        const saveTo = path.join(__dirname, '../public/images/', path.basename(filename));
        uploadPath = '/images/' + path.basename(filename);
        file.pipe(fs.createWriteStream(saveTo));
    });

    busboy.on('finish', async () => {
        try {
            if (uploadPath) updates.image_path = uploadPath;
            await User.update(updates, { where: { id: req.user.id } });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Profile updated' }));
        } catch (err) {
            if (LOG_ENABLED) console.error('Patch me error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });

    req.pipe(busboy);
}

function matchPatchEmail(req) {
    return req.pathname === '/users/me/email' && req.method === 'PATCH';
}

async function handlePatchEmail(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const { email } = JSON.parse(body);
            if (!isValidEmail(email)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Invalid email' }));
            }
            await User.update({ email }, { where: { id: req.user.id } });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Email updated' }));
        } catch (err) {
            if (LOG_ENABLED) console.error('Patch email error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
}

function matchPatchPassword(req) {
    return req.pathname === '/users/me/password' && req.method === 'PATCH';
}

async function handlePatchPassword(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const { oldPassword, newPassword } = JSON.parse(body);
            const user = await User.findByPk(req.user.id);

            const match = await bcrypt.compare(oldPassword, user.password);
            if (!match) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Invalid password' }));
            }

            const hashed = await bcrypt.hash(newPassword, 10);
            await User.update({ password: hashed }, { where: { id: req.user.id } });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Password changed' }));
        } catch (err) {
            if (LOG_ENABLED) console.error('Patch password error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
}

module.exports = [
    { match: matchDeleteMe, handle: withAuth(handleDeleteMe) },
    { match: matchGetUser, handle: handleGetUser },
    { match: matchPatchMe, handle: withAuth(handlePatchMe) },
    { match: matchPatchEmail, handle: withAuth(handlePatchEmail) },
    { match: matchPatchPassword, handle: withAuth(handlePatchPassword) }
];
