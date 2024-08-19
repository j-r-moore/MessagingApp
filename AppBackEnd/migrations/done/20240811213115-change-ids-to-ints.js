'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn('messages', 'messageId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
  });
  await queryInterface.changeColumn('friends', 'userId1', {
    type: Sequelize.INTEGER,
    allowNull: false,
  });
  await queryInterface.changeColumn('friends', 'userId2', {
    type: Sequelize.INTEGER,
    allowNull: false,
  });
  await queryInterface.changeColumn('channel_link', 'userId', {
    type: Sequelize.INTEGER,
    allowNull: false,
  });
  await queryInterface.changeColumn('channel_link', 'channelId', {
    type: Sequelize.INTEGER,
    allowNull: false,
  });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn('messages', 'messageId', {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
  });
  await queryInterface.changeColumn('friends', 'userId1', {
    type: Sequelize.STRING,
    allowNull: false,
  });
  await queryInterface.changeColumn('friends', 'userId2', {
    type: Sequelize.STRING,
    allowNull: false,
  });
  await queryInterface.changeColumn('channel_link', 'userId', {
    type: Sequelize.STRING,
    allowNull: false,
  });
  await queryInterface.changeColumn('channel_link', 'channelId', {
    type: Sequelize.STRING,
    allowNull: false,
  });
  }
};
