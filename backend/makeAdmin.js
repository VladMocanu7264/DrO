require('dotenv').config();
const { User, sequelize } = require('./database');

async function makeAdmin(username) {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const user = await User.findOne({ where: { username } });

        if (!user) {
            console.log(`User '${username}' not found.`);
            return;
        }

        if (user.is_admin) {
            console.log(`User '${username}' is already an admin.`);
        } else {
            user.is_admin = true;
            await user.save();
            console.log(`User '${username}' has been granted admin privileges.`);
        }

    } catch (error) {
        console.error('Error updating user:', error);
    } finally {
        await sequelize.close();
        console.log('Connection closed.');
    }
}

// Change the username below to the target user
const targetUsername = 'vlad';
makeAdmin(targetUsername);
