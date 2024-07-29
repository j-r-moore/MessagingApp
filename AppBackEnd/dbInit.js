const Sequelize = require('sequelize');
const fs = require('fs');

/*
 * Make sure you are on at least version 5 of Sequelize! Version 4 as used in this guide will pose a security threat.
 * You can read more about this issue on the [Sequelize issue tracker](https://github.com/sequelize/sequelize/issues/7310).
 */

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

require('./models/users.js')(sequelize, Sequelize.DataTypes);
require('./models/messages.js')(sequelize, Sequelize.DataTypes);
require('./models/channels.js')(sequelize, Sequelize.DataTypes);
require('./models/channel_link.js')(sequelize, Sequelize.DataTypes);
require('./models/friends.js')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f')

sequelize.sync({ force }).then(async () => {
	console.log('Database synced');

	sequelize.close();
}).catch(console.error);