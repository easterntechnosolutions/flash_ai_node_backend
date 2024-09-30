const Sequelize = require("sequelize");
const sequelize = require("../core-configurations/sequelize-config/sequelize");

// Import models
const User = require("./user")(sequelize);
const Chat = require("./chat")(sequelize);
const Image = require("./image")(sequelize);
const Chat_Reply = require("./chat_reply")(sequelize);
const Event = require("./event")(sequelize);

const db = {
  User,
  Chat,
  Image,
  Chat_Reply,
  Event,
  sequelize,
  Sequelize,
};

// Define model associations
User.associate({
  Chat,
  Image,
  Event,
});
Chat.associate({ User });
Image.associate({ User });
Event.associate({ User });

module.exports = db;
