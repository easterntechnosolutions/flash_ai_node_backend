"use strict";

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Chat_Reply extends Model {
    static associate(models) {}
  }
  Chat_Reply.init(
    {
      chat_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reply: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Chat_Reply",
    }
  );
  return Chat_Reply;
};
