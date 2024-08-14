module.exports = (sequelize, DataTypes) => {
    const users = sequelize.define('users', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true, 
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        hashedPassword: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        token: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        socketId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: { //eg, 0 = offline, 1 = online, 2 = away, 3 = busy
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        statusMessage: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    return users;
}