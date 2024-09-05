"use strict";

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class History extends Model {
    static associate(models) {
      History.belongsTo(models.User, {
        foreignKey: "email",
        as: "user",
      });
    }
  }
  History.init(
    {
      history: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        references: {
          model: "Users",
          key: "email",
        },
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
    },

    {
      sequelize,
      modelName: "History",
    }
  );
  return History;
};
