const Sequelize = require("sequelize");
const sequelize = require("../core-configurations/sequelize-config/sequelize");

// Import models
const User = require("./user")(sequelize);
const Chat = require("./chat")(sequelize);
const Image = require("./image")(sequelize);
const Chat_Reply = require("./chat_reply")(sequelize);

const db = {
  User,
  Chat,
  Image,
  Chat_Reply,
  sequelize,
  Sequelize,
};

// Define model associations
if (User.associate) {
  User.associate(db);
}

module.exports = db;
