const Sequelize = require('sequelize');
const channel_link = require('./models/channel_link.js');


const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});


const users = require('./models/users.js')(sequelize, Sequelize.DataTypes);
const messages = require('./models/messages.js')(sequelize, Sequelize.DataTypes);
const channels = require('./models/channels.js')(sequelize, Sequelize.DataTypes);
const channelLink = require('./models/channel_link.js')(sequelize, Sequelize.DataTypes);
const friends = require('./models/friends.js')(sequelize, Sequelize.DataTypes);





module.exports = { users, messages, channels, channelLink, friends };