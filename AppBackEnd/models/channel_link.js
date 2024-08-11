module.exports = (sequelize, DataTypes) => {
    const channelLink = sequelize.define('channelLink', {
        channelId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        tableName: 'channel_link', // Explicitly set the table name, otherwise it will be 'channelLinks'
    });

    return channelLink;
}