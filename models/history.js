"use strict";

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class History extends Model {
    static associate(models) {
      // Associations
      History.belongsTo(models.User, {
        foreignKey: "email",
        as: "user",
      });
    }
  }
  History.init(
    {
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
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },

    {
      sequelize,
      modelName: "History",
    }
  );
  return History;
};
