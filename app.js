const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

// CORE CONFIG MODULES
const logger = require("./core-configurations/logger-config/loggers");
const sequelize = require("./core-configurations/sequelize-config/sequelize");

// DB MODELS MODULES
const db = require("./models");

// ROUTES
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const tweetRoutes = require("./routes/tweetRoutes");
const historyRoutes = require("./routes/historyRoutes");
const featuresRoutes = require("./routes/featuresRoutes");

// MIDDLEWARES MODULES
const loggerMiddleware = require("./middlewares/loggerMiddleware");
const { verifyToken } = require("./middlewares/verifyToken");

// Determine the environment (default to 'development')
const environment = process.env.NODE_ENV || "development";

// Load the appropriate .env file
dotenv.config({ path: `.env.${environment}` });

logger.info(`----->>>> Running in ${environment} environment <<<<-----`);

const PORT = process.env.PORT || 8080;

const app = express();

// CORS CONFIG
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = ["https://aiflash.dating", /\.aiflash\.dating$/];
      if (!origin || allowedOrigins.some((pattern) => pattern.test(origin))) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// LIMITING THE REQUEST
const limiter = rateLimit({
  windowMs: 5 * 1000,
  max: 5,
  message: "Too many requests, please try again later.",
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// MIDDLEWARE
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(limiter);
app.use(loggerMiddleware);

// TEST ROUTES
app.get("/", (req, res) => {
  res.status(200).send("HELLO WORLD....");
  res.end();
});

// ---------------- PUBLIC ROUTES -----------------------

// AUTH ROUTES
app.use(`${process.env.BASE_URL}/auth`, authRoutes);

// ---------------- PRIVATE ROUTES -----------------------
app.use(verifyToken);

// CHAT ROUTES
app.use(`${process.env.BASE_URL}/chat`, chatRoutes);

// TWEETS ROUTES
app.use(`${process.env.BASE_URL}/tweets`, tweetRoutes);

// HISTORY ROUTES
app.use(`${process.env.BASE_URL}/history`, historyRoutes);

// FEATURES ROUTES
app.use(`${process.env.BASE_URL}/features`, featuresRoutes);

// AUTHENTICATE SEQUELIZE AND ESTABLISH CONNECTION WITH DB
db.sequelize
  .authenticate()
  .then(() => {
    logger.info("Query : Connection has been established successfully.");
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () =>
      logger.info(`Query : Server is running on PORT ::: ${PORT}`)
    );
  })
  .catch((err) => {
    logger.info("Query : Unable to connect to the database:", err);
  });
