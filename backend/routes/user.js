const { User } = require('../database');
const { withAuth } = require('../helpers');

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

module.exports = [
    { match: matchDeleteMe, handle: withAuth(handleDeleteMe) }
];
