"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Chats", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      chat_id: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      message: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      me: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      sequence: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Chats");
  },
};
