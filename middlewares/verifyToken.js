const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// CORE-CONFIG
const logger = require("../core-configurations/logger-config/loggers");

// UTILS MODULES
const message = require("../utils/commonMessages");
const { errorResponse } = require("../utils/handleResponses");

// MIDDLEWARE
const { isBlacklisted } = require("./blackListToken");

dotenv.config();

// THIS FUNCTIONALITY WILL VERIFY THE GENERATED TOKEN AND PROVIDE THE ACCESS TO FURTHER ROUTES.
const verifyToken = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token || isBlacklisted(token)) {
    return errorResponse(res, message.AUTH.UNAUTHORIZED_TOKEN, null, 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.email = decoded.email;

    next();
  } catch (error) {
    logger.error("Error in verify token ::: ", error);
    return errorResponse(res, message.AUTH.INVALID_TOKEN, error, 400);
  }
};

module.exports = { verifyToken };
