module.exports = (sequelize, DataTypes) => {
    const channels = sequelize.define('channels', {
        channelId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    return channels;
}