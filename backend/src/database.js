require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
    }
);

const User = sequelize.define('User', {
    email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    password: { type: DataTypes.STRING(250), allowNull: false },
    reset_token: { type: DataTypes.STRING(250) },
    token_expire: { type: DataTypes.DATE },
    username: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    image_path: { type: DataTypes.STRING(250), unique: true },
    description: { type: DataTypes.STRING(500) },
    is_admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
});

const Drink = sequelize.define('Drink', {
    id: { type: DataTypes.STRING(20), primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
    brand: { type: DataTypes.STRING(50) },
    image_url: { type: DataTypes.STRING(250) },
    nutrition_grade: { type: DataTypes.STRING(10) },
    quantity: { type: DataTypes.INTEGER },
    packaging: { type: DataTypes.STRING(250) }
}, { timestamps: false });

const Favorite = sequelize.define('Favorite', {});
Favorite.belongsTo(User, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Favorite.belongsTo(Drink, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

const List = sequelize.define('List', {
    name: { type: DataTypes.STRING(50) },
    public: { type: DataTypes.BOOLEAN }
});
List.belongsTo(User, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

const ListDrink = sequelize.define('ListDrink', {});
ListDrink.belongsTo(List, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
ListDrink.belongsTo(Drink, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

const Group = sequelize.define('Group', {
    name: { type: DataTypes.STRING(50), allowNull: false },
    description: { type: DataTypes.STRING(500) }
});
Group.belongsTo(User, { as: 'Owner', foreignKey: 'owner_id', onDelete: 'CASCADE' });

const Member = sequelize.define('Member', {});
Member.belongsTo(Group, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Member.belongsTo(User, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

const Post = sequelize.define('Post', {
    text: { type: DataTypes.STRING(500), allowNull: false },
    time: { type: DataTypes.DATE, allowNull: false }
});
Post.belongsTo(Member, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Post.belongsTo(Drink, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

const Like = sequelize.define('Like', {});
Like.belongsTo(Member, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Like.belongsTo(Post, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

const Tag = sequelize.define('Tag', {
    name: { type: DataTypes.STRING(50), allowNull: false }
});

const DrinkTag = sequelize.define('DrinkTag', {});
DrinkTag.belongsTo(Drink, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
DrinkTag.belongsTo(Tag, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

// Reverse

User.hasMany(Favorite, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Drink.hasMany(Favorite, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

User.hasMany(List, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
List.hasMany(ListDrink, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Drink.hasMany(ListDrink, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

User.hasMany(Group, { foreignKey: 'owner_id', onDelete: 'CASCADE' });
Group.hasMany(Member, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
User.hasMany(Member, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

Member.hasMany(Post, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Drink.hasMany(Post, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Member.hasMany(Like, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Post.hasMany(Like, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

Drink.hasMany(DrinkTag, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Tag.hasMany(DrinkTag, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });


module.exports = {
    sequelize,
    User,
    Drink,
    Favorite,
    List,
    ListDrink,
    Group,
    Member,
    Post,
    Like,
    Tag,
    DrinkTag
};

async function syncUp({ alter = false, force = false } = {}) {
    try {
        await sequelize.authenticate();
        console.log('Connection established.');

        await sequelize.sync({ alter, force });
        console.log('Database synchronized.');

    } catch (error) {
        console.error('Error syncing database:', error);
    } finally {
        await sequelize.close();
        console.log('Connection closed.');
    }
}

//syncUp({ alter: true });