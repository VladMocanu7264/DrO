const { User } = require('../database');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { isValidEmail, isValidUsername } = require('../helpers');

const LOG_ENABLED = process.env.LOG_ENABLED === 'true';
const SALT_ROUNDS = 10;

function matchSignup(req) {
    return req.pathname === '/auth/signup' && req.method === 'POST';
}

async function handleSignup(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const data = JSON.parse(body);
            const { email, username, password, confirmPassword } = data;

            if (!email || !username || !password || password !== confirmPassword) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Invalid or missing fields' }));
            }
            if (!isValidEmail(email)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Invalid email format' }));
            }
            if (!isValidUsername(username)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Invalid username format' }));
            }

            const existing = await User.findOne({
                where: {
                    [Op.or]: [{ email }, { username }]
                }
            });

            if (existing) {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Email or username already exists' }));
            }

            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            const newUser = await User.create({
                email,
                username,
                password: hashedPassword
            });

            const userData = {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username
            };

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: 'User created successfully',
                user: userData
            }));
        } catch (err) {
            if (LOG_ENABLED) console.error('Signup error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
}

function matchLogin(req) {
    return req.pathname === '/auth/login' && req.method === 'POST';
}

async function handleLogin(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const { email, password } = JSON.parse(body);

            if (!email || !password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Missing fields' }));
            }

            const user = await User.findOne({ where: { email } });
            if (!user) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Invalid credentials' }));
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Invalid credentials' }));
            }

            const tokenPayload = {
                id: user.id,
                username: user.username,
                email: user.email,
                is_admin: user.is_admin
            };

            const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN || '2h'
            });

            const responseUser = {
                id: user.id,
                email: user.email,
                username: user.username,
                image_path: user.image_path,
                description: user.description,
                is_admin: user.is_admin
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: 'Login successful',
                token,
                user: responseUser
            }));
        } catch (err) {
            if (LOG_ENABLED) console.error('Login error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
}

function matchCheckEmail(req) {
    return req.pathname === '/auth/check-email' && req.method === 'GET';
}

async function handleCheckEmail(req, res) {
    const email = req.query.email;
    if (!email) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Missing email' }));
    }

    if (!isValidEmail(email)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Invalid email format' }));
    }

    try {
        const exists = await User.findOne({ where: { email } });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ available: !exists }));
    } catch (err) {
        if (LOG_ENABLED) console.error('Email check error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchCheckUsername(req) {
    return req.pathname === '/auth/check-username' && req.method === 'GET';
}

async function handleCheckUsername(req, res) {
    const username = req.query.username;
    if (!username) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Missing username' }));
    }

    if (!isValidUsername(username)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Invalid username format' }));
    }

    try {
        const exists = await User.findOne({ where: { username } });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ available: !exists }));
    } catch (err) {
        if (LOG_ENABLED) console.error('Username check error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

module.exports = [
    { match: matchSignup, handle: handleSignup },
    { match: matchLogin, handle: handleLogin },
    { match: matchCheckEmail, handle: handleCheckEmail },
    { match: matchCheckUsername, handle: handleCheckUsername }
];
