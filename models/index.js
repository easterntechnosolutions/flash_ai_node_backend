const Sequelize = require("sequelize");
const sequelize = require("../core-configurations/sequelize-config/sequelize");

// Import models
const User = require("./user")(sequelize);
const History = require("./history")(sequelize);

const db = {
  User,
  History,
  sequelize,
  Sequelize,
};

// Define model associations
User.associate({
  History,
});
History.associate({ User });

module.exports = db;
