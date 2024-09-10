"use strict";

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Chat extends Model {
    static associate(models) {}
  }
  Chat.init(
    {
      chat_id: {
        type: DataTypes.STRING,
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
    },
    {
      sequelize,
      modelName: "Chat",
    }
  );
  return Chat;
};
