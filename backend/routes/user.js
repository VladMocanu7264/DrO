const { User, List, ListDrink, Drink } = require('../database');
const { withAuth, isValidEmail, isValidUsername } = require('../helpers');
const bcrypt = require('bcrypt');
const busboy = require('busboy');
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
    const match = req.pathname.match(/^\/users\/([a-zA-Z0-9_]{2,20})$/);
    if (match && req.method === 'GET') {
        return { params: { username: match[1] } };
    }
    return false;
}

async function handleGetUser(req, res) {
    try {
        userToFind = req.params.username;
        if (userToFind === "me") {
            userToFind = req.user.username
        }
        console.log(`User: ${userToFind}`);

        const user = await User.findOne({
            where: { username: userToFind },
            include: {
                model: List,
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

        const isSelf = req.user?.id === user.id;
        const lists = user.Lists
            .filter(list => isSelf || list.public)
            .map(list => ({
                id: list.id,
                name: list.name,
                drinks: list.ListDrinks.map(ld => ld.Drink)
            }));

        let imageDataUrl = null;
        if (user.image_path) {
            const filePath = path.join(__dirname, '../public', user.image_path);
            const ext = path.extname(user.image_path).toLowerCase();

            let mime = 'image/jpeg';
            if (ext === '.png') mime = 'image/png';
            else if (ext === '.webp') mime = 'image/webp';
            else if (ext === '.gif') mime = 'image/gif';
            else if (ext === '.svg') mime = 'image/svg+xml';

            const base64Data = fs.readFileSync(filePath).toString('base64');
            imageDataUrl = `data:${mime};base64,${base64Data}`;
        }

        const result = {
            username: user.username,
            email: isSelf ? user.email : 'hidden',
            description: user.description,
            image: imageDataUrl,
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
    const bb = busboy({ headers: req.headers });
    const updates = {};
    let uploadPath = null;
    let oldImagePath = null;

    User.findByPk(req.user.id).then(user => {
        if (user && user.image_path) {
            oldImagePath = path.join(__dirname, '../public', user.image_path);
        }
    });

    bb.on('field', (fieldname, val) => {
        if (fieldname === 'username' && isValidUsername(val)) updates.username = val;
        if (fieldname === 'description') updates.description = val;
    });

    bb.on('file', (fieldname, file, fileInfo) => {
        const { filename, mimeType } = fileInfo;

        if (!filename || typeof filename !== 'string') {
            if (LOG_ENABLED) console.warn('Skipping file: missing or invalid filename');
            file.resume();
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(mimeType)) {
            if (LOG_ENABLED) console.warn(`Rejected file: ${filename} — unsupported type (${mimeType})`);
            file.resume();
            return;
        }

        const ext = path.extname(filename);
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
        const safePath = path.join(__dirname, '../public/images/', uniqueName);
        uploadPath = '/images/' + uniqueName;

        if (LOG_ENABLED) console.log(`Accepting upload: ${filename} -> ${uploadPath}`);
        file.pipe(fs.createWriteStream(safePath));
    });

    bb.on('finish', async () => {
        try {
            if (uploadPath) {
                updates.image_path = uploadPath;
                if (oldImagePath && fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    if (LOG_ENABLED) console.log(`Deleted old image: ${oldImagePath}`);
                }
            }

            await User.update(updates, { where: { id: req.user.id } });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Profile updated' }));
        } catch (err) {
            if (LOG_ENABLED) console.error('Patch me error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });

    req.pipe(bb);
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
    { match: matchGetUser, handle: withAuth(handleGetUser) },
    { match: matchPatchMe, handle: withAuth(handlePatchMe) },
    { match: matchPatchEmail, handle: withAuth(handlePatchEmail) },
    { match: matchPatchPassword, handle: withAuth(handlePatchPassword) }
];
