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
    await queryInterface.addColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'example@example.com',
      unique: true,
    });
    await queryInterface.addColumn('users', 'hashedPassword', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'password',
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('users', 'email');
    await queryInterface.removeColumn('users', 'hashedPassword');
  }
};
