"use strict";

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Image extends Model {
    static associate(models) {
      // Each image belongs to a user
      Image.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }
  Image.init(
    {
      chat_id: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      image_url: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
      },
    },
    {
      sequelize,
      modelName: "Image",
    }
  );
  return Image;
};
