const jwt = require('jsonwebtoken');

function verifyJWT(req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Authorization header missing or malformed' };
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { user: decoded };
    } catch (err) {
        return { error: 'Invalid or expired token' };
    }
}

function withAuth(handler) {
    return async (req, res) => {
        const result = verifyJWT(req);
        if (result.error) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: result.error }));
        }
        req.user = result.user;
        return handler(req, res);
    };
}

const IGNORED_TAGS = new Set([
    'beverages', 'colas', 'drinks',
    'non-alcoholic-beverages',
    'beverages-and-beverages-preparations', 'foods', 'food',
    'breakfasts', 'fruits', 'apples',
    'desserts', 'kefir', 'milkshakes',
    'boissons', 'eaux', 'guavas', 'citrus', 'oranges',
    'snacks', 'confectioneries', 'candies', 'kombuchas',
    'ayran', 'capsules', 'sweeteners', 'gose', 'getranke',
    'condiments', 'spices', 'ginger', 'groceries', 'sugars',
    'maple', 'rooibos', 'spreads', 'pastries', 'macarons'
]);

function isRelevantTag(name) {
    return /^[a-zA-Z]+$/.test(name) && !IGNORED_TAGS.has(name);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username) {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

module.exports = {
    isRelevantTag,
    verifyJWT,
    withAuth,
    isValidEmail,
    isValidUsername
};