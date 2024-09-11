const Sequelize = require("sequelize");
const sequelize = require("../core-configurations/sequelize-config/sequelize");

// Import models
const User = require("./user")(sequelize);
const History = require("./history")(sequelize);
const Chat = require("./chat")(sequelize);
const Image = require("./image")(sequelize);
const Chat_Reply = require("./chat_reply")(sequelize);

const db = {
  User,
  History,
  Chat,
  Image,
  Chat_Reply,
  sequelize,
  Sequelize,
};

// Define model associations
User.associate({
  History,
});

module.exports = db;
