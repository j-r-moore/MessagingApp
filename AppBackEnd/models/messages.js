module.exports = (sequelize, DataTypes) => {
    const messages = sequelize.define('messages', {
        messageId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        channelId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });

    return messages;
}