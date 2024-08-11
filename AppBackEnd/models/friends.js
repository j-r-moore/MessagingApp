module.exports = (sequelize, DataTypes) => {
    const friends = sequelize.define('friends', { //having id 1 and id 2 makes it so when you search for friends, you can search for both id1 and id2
        userId1: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        userId2: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });

    return friends;
}