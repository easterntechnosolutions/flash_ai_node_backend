"use strict";

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // One user can have many chats
      User.hasMany(models.Chat, {
        foreignKey: "user_id",
        as: "chats",
      });

      // One user can have many images
      User.hasMany(models.Image, {
        foreignKey: "user_id",
        as: "images",
      });
    }
  }
  User.init(
    {
      user_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      is_google: {
        type: DataTypes.CHAR,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
