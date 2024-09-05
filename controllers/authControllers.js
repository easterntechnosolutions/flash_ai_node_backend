const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

// USER MODEL
const { User } = require("../models");

// CORE-CONFIG MODULES
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../core-configurations/jwt-config/generateToken");
const logger = require("../core-configurations/logger-config/loggers");

// UTILS MODULES
const { successResponse, errorResponse } = require("../utils/handleResponses");
const message = require("../utils/commonMessages");

// MIDDLEWARE
const { addToBlacklist } = require("../middlewares/blackListToken");

dotenv.config();

// FUNCTIO TO LOGIN THE USER (USING GOOGLE LOGIN)
const loginUser = async (req, res) => {
  try {
    logger.info("authControllers --> loginUser --> reached");

    const { name, email } = req.body;

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        name,
        email,
      });
    }

    // GENERATE TOKENS
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    const userData = {
      accessToken,
      refreshToken,
      name: user.name,
      email: user.email,
    };

    logger.info("authControllers --> loginUser --> ended");
    return successResponse(res, message.AUTH.VERIFIED_USER, userData, 200);
  } catch (error) {
    logger.error("authControllers --> loginUser --> error", error);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

// FUNCTION TO LOGOUT THE USER
const logoutUser = (req, res) => {
  try {
    logger.info("authControllers --> logoutUser --> reached");

    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
      return errorResponse(res, message.AUTH.UNAUTHORIZED_TOKEN, null, 401);
    }

    addToBlacklist(token);

    logger.info("authControllers --> logoutUser --> ended");
    return successResponse(res, message.AUTH.LOGOUT, null, 200);
  } catch (error) {
    logger.error("authControllers --> logoutUser --> error", error);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

// FUNCTION TO REFRESH TOKEN (RESPONSE BACK THE ACCES TOKEN)
const refreshAccessToken = (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, message.AUTH.UNAUTHORIZED_TOKEN, null, 427);
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = generateAccessToken(decoded.userId);

    logger.info("authControllers --> refreshAccessToken --> ended");
    return successResponse(
      res,
      message.AUTH.TOKEN_REFRESHED,
      { accessToken: newAccessToken },
      200
    );
  } catch (error) {
    logger.error("authControllers --> refreshAccessToken --> error", error);
    return errorResponse(res, message.AUTH.INVALID_TOKEN, error, 403);
  }
};
module.exports = { loginUser, logoutUser, refreshAccessToken };
