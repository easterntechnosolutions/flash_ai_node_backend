"use strict";

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Chat extends Model {
    static associate(models) {
      // Each chat belongs to a user
      Chat.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    }
  }
  Chat.init(
    {
      chat_id: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      me: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      sequence: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Chat",
    }
  );
  return Chat;
};
