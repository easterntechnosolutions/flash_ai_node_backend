const dotenv = require("dotenv");
const { Sequelize } = require("sequelize");

// CORE-CONFIG MODULES
const logger = require("../logger-config/loggers");

// Determine the environment (default to 'development')
const environment = process.env.NODE_ENV || "development";

// Load the appropriate .env file
dotenv.config({ path: `.env.${environment}` });

const infoLogger = {
  info: (msg) => logger.info(msg),
};

const sequelize = new Sequelize({
  database: process.env.MYSQL_DATABASE,
  dialect: process.env.MYSQL_DIALECT,
  logging: (msg) => infoLogger.info("Query : " + msg),
  logQueryParameters: true,
  replication: {
    read: [
      {
        host: process.env.R_MYSQL_HOST,
        username: process.env.R_MYSQL_USERNAME,
        password: process.env.R_MYSQL_PASSWORD,
        port: process.env.R_MYSQL_DBPORT,
      },
    ],
    write: {
      host: process.env.W_MYSQL_HOST,
      username: process.env.W_MYSQL_USERNAME,
      password: process.env.W_MYSQL_PASSWORD,
      port: process.env.W_MYSQL_DBPORT,
    },
  },
});

module.exports = sequelize;
