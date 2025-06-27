const { Group, Member, Post, Drink, User, Like } = require('../database');
const { withAuth } = require('../helpers');
const { Op } = require('sequelize');

function matchGetUserGroups(req) {
    return req.pathname === '/groups/user' && req.method === 'GET';
}

async function handleGetUserGroups(req, res) {
    try {
        const memberships = await Member.findAll({
            where: { UserId: req.user.id },
            include: {
                model: Group,
                attributes: ['id', 'name', 'description']
            }
        });

        const groups = memberships.map(m => m.Group);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(groups));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchGetGroupPosts(req) {
    const match = req.pathname.match(/^\/groups\/([^/]+)\/posts$/);
    if (match && req.method === 'GET') return { params: { groupId: match[1] } };
    return false;
}

async function handleGetGroupPosts(req, res) {
    try {
        const { groupId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { rows: posts, count } = await Post.findAndCountAll({
            order: [['time', 'DESC']],
            limit,
            offset,
            include: [
                {
                    model: Member,
                    required: true,
                    where: { GroupId: groupId },
                    include: {
                        model: User,
                        attributes: ['username', 'image_path', 'id']
                    }
                },
                {
                    model: Drink,
                    attributes: ['id', 'name', 'image_url']
                },
                {
                    model: Like,
                    required: false
                }
            ]
        });

        const member = await Member.findOne({
            where: {
                GroupId: groupId,
                UserId: req.user.id
            }
        });

        const memberId = member?.id;

        const result = posts.map(post => ({
            id: post.id,
            text: post.text,
            time: post.time,
            likes: post.Likes.length,
            likedByUser: post.Likes.some(like => like.MemberId === memberId),
            member: {
                username: post.Member.User.username,
                image_path: post.Member.User.image_path,
                id: post.Member.User.id,
            },
            drink: post.Drink
        }));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ posts: result, max_pages: Math.ceil(count / limit) }));
    } catch (err) {
        console.log("Error: " + err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchPostLikePost(req) {
    const match = req.pathname.match(/^\/groups\/([^/]+)\/posts\/([^/]+)\/like$/);
    if (match && req.method === 'POST') return { params: { groupId: match[1], postId: match[2] } };
    return false;
}

async function handleLikePost(req, res) {
    try {
        const { groupId, postId } = req.params;

        const member = await Member.findOne({ where: { GroupId: groupId, UserId: req.user.id } });
        if (!member) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'You are not a member of this group' }));
        }

        const post = await Post.findByPk(postId, { include: Member });
        if (!post || post.Member.GroupId !== Number(groupId)) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Post not found in group' }));
        }

        const existing = await Like.findOne({
            where: { MemberId: member.id, PostId: postId }
        });

        if (existing) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Already liked' }));
        }

        await Like.create({ MemberId: member.id, PostId: postId });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Post liked' }));
    } catch (err) {
        console.log("Error: " + err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchGetAvailableGroups(req) {
    return req.pathname === '/groups/available' && req.method === 'GET';
}

async function handleGetAvailableGroups(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        const memberGroups = await Member.findAll({
            where: { UserId: req.user.id },
            attributes: ['GroupId']
        });

        const joinedGroupIds = memberGroups.map(m => m.GroupId);

        const { rows: groups, count } = await Group.findAndCountAll({
            where: {
                id: { [Op.notIn]: joinedGroupIds },
                [Op.or]: [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { description: { [Op.iLike]: `%${search}%` } }
                ]
            },
            limit,
            offset
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ groups, max_pages: Math.ceil(count / limit) }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchJoinGroup(req) {
    const match = req.pathname.match(/^\/groups\/([^/]+)\/join$/);
    if (match && req.method === 'POST') return { params: { groupId: match[1] } };
    return false;
}

async function handleJoinGroup(req, res) {
    try {
        const { groupId } = req.params;
        const group = await Group.findByPk(groupId);
        if (!group) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Group doesn’t exist' }));
        }

        const existing = await Member.findOne({
            where: { UserId: req.user.id, GroupId: groupId }
        });

        if (existing) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Already a member' }));
        }

        await Member.create({ UserId: req.user.id, GroupId: groupId });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Joined group' }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchCreateGroup(req) {
    return req.pathname === '/groups' && req.method === 'POST';
}

async function handleCreateGroup(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const { name, description } = JSON.parse(body);
            if (!name || !description) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Missing fields' }));
            }
            const group = await Group.create({ name, description, owner_id: req.user.id });
            await Member.create({ UserId: req.user.id, GroupId: group.id });
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Group created', id: group.id }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
}

function matchPostToGroup(req) {
    const match = req.pathname.match(/^\/groups\/([^/]+)\/posts$/);
    if (match && req.method === 'POST') return { params: { groupId: match[1] } };
    return false;
}

async function handlePostToGroup(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const { text, drinkId } = JSON.parse(body);
            if (!text || !drinkId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Missing fields' }));
            }
            const member = await Member.findOne({ where: { UserId: req.user.id, GroupId: req.params.groupId } });
            if (!member) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Not a group member' }));
            }
            await Post.create({ text, time: new Date(), DrinkId: drinkId, MemberId: member.id });
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Post created' }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
}

function matchLeaveGroup(req) {
    const match = req.pathname.match(/^\/groups\/([^/]+)\/leave$/);
    if (match && req.method === 'DELETE') return { params: { groupId: match[1] } };
    return false;
}

async function handleLeaveGroup(req, res) {
    try {
        const group = await Group.findByPk(req.params.groupId);
        if (!group) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Group not found' }));
        }
        const member = await Member.findOne({ where: { UserId: req.user.id, GroupId: group.id } });
        if (!member) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Not a member' }));
        }
        await member.destroy();
        if (group.owner_id === req.user.id) {
            const newOwner = await Member.findOne({ where: { GroupId: group.id }, order: [['createdAt', 'ASC']] });
            if (newOwner) await group.update({ owner_id: newOwner.UserId });
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Left group' }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchKickUser(req) {
    const match = req.pathname.match(/^\/groups\/([^/]+)\/kick\/([^/]+)$/);
    if (match && req.method === 'DELETE') return { params: { groupId: match[1], userId: match[2] } };
    return false;
}

async function handleKickUser(req, res) {
    try {
        const group = await Group.findByPk(req.params.groupId);
        if (!group || group.owner_id !== req.user.id) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Not authorized' }));
        }
        const member = await Member.findOne({ where: { UserId: req.params.userId, GroupId: group.id } });
        if (!member) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'User not found in group' }));
        }
        await member.destroy();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User removed from group' }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchDeletePost(req) {
    const match = req.pathname.match(/^\/groups\/([^/]+)\/posts\/([^/]+)$/);
    if (match && req.method === 'DELETE') return { params: { groupId: match[1], postId: match[2] } };
    return false;
}

async function handleDeletePost(req, res) {
    try {
        const group = await Group.findByPk(req.params.groupId);
        if (!group || group.owner_id !== req.user.id) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Not authorized' }));
        }
        const post = await Post.findByPk(req.params.postId, {
            include: { model: Member, where: { GroupId: group.id } }
        });
        if (!post) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Post not found' }));
        }
        await post.destroy();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Post deleted' }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

function matchIsGroupAdmin(req) {
    const match = req.pathname.match(/^\/groups\/([^/]+)\/is-admin$/);
    if (match && req.method === 'GET') return { params: { groupId: match[1] } };
    return false;
}

async function handleIsGroupAdmin(req, res) {
    try {
        const { groupId } = req.params;
        const group = await Group.findByPk(groupId);
        if (!group) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Group not found' }));
        }
        if (group.owner_id !== req.user.id) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ isAdmin: false }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ isAdmin: true }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

module.exports = [
    { match: matchPostToGroup, handle: withAuth(handlePostToGroup) },
    { match: matchLeaveGroup, handle: withAuth(handleLeaveGroup) },
    { match: matchKickUser, handle: withAuth(handleKickUser) },
    { match: matchDeletePost, handle: withAuth(handleDeletePost) },
    { match: matchGetUserGroups, handle: withAuth(handleGetUserGroups) },
    { match: matchGetGroupPosts, handle: withAuth(handleGetGroupPosts) },
    { match: matchPostLikePost, handle: withAuth(handleLikePost) },
    { match: matchGetAvailableGroups, handle: withAuth(handleGetAvailableGroups) },
    { match: matchJoinGroup, handle: withAuth(handleJoinGroup) },
    { match: matchCreateGroup, handle: withAuth(handleCreateGroup) },
    { match: matchIsGroupAdmin, handle: withAuth(handleIsGroupAdmin) }
];