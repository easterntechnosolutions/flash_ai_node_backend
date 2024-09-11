"use strict";

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Image extends Model {
    static associate(models) {}
  }
  Image.init(
    {
      chat_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image_url: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Image",
    }
  );
  return Image;
};
