module.exports = (sequelize, DataTypes) => {
    const channelLink = sequelize.define('channelLink', {
        channelId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    return channelLink;
}