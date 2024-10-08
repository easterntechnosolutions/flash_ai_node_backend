const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const jwksClient = require("jwks-rsa");
const { v4: uuidv4 } = require("uuid");

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

// Determine the environment (default to 'development')
const environment = process.env.NODE_ENV || "development";

// Load the appropriate .env file
dotenv.config({ path: `.env.${environment}` });

// FUNCTION TO LOGIN THE USER (USING GOOGLE LOGIN)
const googleLoginUser = async (req, res) => {
  try {
    logger.info("authControllers --> googleLoginUser --> reached");

    const { name, email, id } = req.body;

    // Check if only email is provided
    if (!email) {
      logger.warn("authControllers --> googleLoginUser --> email is required");
      return errorResponse(res, message.AUTH.EMAIL_REQUIRED, null, 400);
    }

    // Find the user by email and check if is_google is set to "1"
    let userByEmail = await User.findOne({
      where: { email, is_google: "1" },
    });

    // If ID is not provided, handle email-based login/registration
    if (!id) {
      if (userByEmail) {
        // User exists with the provided email
        const accessToken = generateAccessToken(
          userByEmail.user_id,
          userByEmail.email
        );
        const refreshToken = generateRefreshToken(
          userByEmail.user_id,
          userByEmail.email
        );

        const userData = {
          accessToken,
          refreshToken,
          name: userByEmail.name,
          email: userByEmail.email,
        };

        logger.info(
          "authControllers --> googleLoginUser --> user logged in with email only"
        );
        return successResponse(res, message.AUTH.VERIFIED_USER, userData, 200);
      } else {
        // No user found with this email, create a new user with email only
        let generatedUserName = email.split("@")[0];
        const newUser = await User.create({
          name: name || generatedUserName,
          email,
          user_id: uuidv4(),
          is_google: "1",
        });

        // Generate tokens
        const accessToken = generateAccessToken(newUser.user_id, newUser.email);
        const refreshToken = generateRefreshToken(
          newUser.user_id,
          newUser.email
        );

        const userData = {
          accessToken,
          refreshToken,
          name: newUser.name,
          email: newUser.email,
        };

        logger.info(
          "authControllers --> googleLoginUser --> new user created with email only"
        );
        return successResponse(
          res,
          message.AUTH.NEW_USER_CREATED,
          userData,
          201
        );
      }
    }

    // If ID is provided, continue with the original logic
    // Find the user by id and check if is_google is set to "1"
    let userById = await User.findOne({
      where: { user_id: id, is_google: "1" },
    });

    // Condition 1: New user with a new Gmail and new ID
    if (!userByEmail && !userById) {
      // No user found with this email or id, so create a new user
      const newUser = await User.create({
        name,
        email,
        user_id: id,
        is_google: "1",
      });

      // Generate tokens
      const accessToken = generateAccessToken(newUser.user_id, newUser.email);
      const refreshToken = generateRefreshToken(newUser.user_id, newUser.email);

      const userData = {
        accessToken,
        refreshToken,
        name: newUser.name,
        email: newUser.email,
      };

      logger.info("authControllers --> googleLoginUser --> new user created");
      return successResponse(res, message.AUTH.VERIFIED_USER, userData, 200);
    }

    // Condition 2: Same Gmail, is_google = Y, but different ID
    if (userByEmail && userByEmail.user_id !== id) {
      logger.warn(
        "authControllers --> googleLoginUser --> different ID with same Gmail"
      );
      return errorResponse(
        res,
        message.AUTH.EMAIL_ALREADY_REGISTERED_WITH_DIFFERENT_ID,
        null,
        400
      );
    }

    // Condition 3: New Gmail, is_google = Y, but existing ID
    if (userById && userById.email !== email) {
      logger.warn(
        "authControllers --> googleLoginUser --> different Gmail with same ID"
      );
      return errorResponse(
        res,
        message.AUTH.ID_ALREADY_REGISTERED_WITH_DIFFERENT_EMAIL,
        null,
        400
      );
    }

    // If the user exists with the same email and ID, log them in
    if (userByEmail && userByEmail.user_id === id) {
      const accessToken = generateAccessToken(
        userByEmail.user_id,
        userByEmail.email
      );
      const refreshToken = generateRefreshToken(
        userByEmail.user_id,
        userByEmail.email
      );

      const userData = {
        accessToken,
        refreshToken,
        name: userByEmail.name,
        email: userByEmail.email,
      };

      logger.info(
        "authControllers --> googleLoginUser --> existing user logged in"
      );
      return successResponse(res, message.AUTH.VERIFIED_USER, userData, 200);
    }
  } catch (error) {
    logger.error(`Error in google login user: ${error.message}`);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

// FUNCTION TO GENERATE KEY
const getKey = async (kid) => {
  const client = jwksClient({
    jwksUri: "https://appleid.apple.com/auth/keys",
    timeout: 30000,
  });

  const key = await client.getSigningKey(kid);
  return key.getPublicKey();
};

// FUNCTION TO GENERATE CLINET SECRET
const generateAppleClientSecret = () => {
  try {
    const privateKey = `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg8Ns+ikRhb3If6nW2
c6Xp+J4IVhx13RpZRjDhd0d92J+gCgYIKoZIzj0DAQehRANCAAS/sbRehYOvEryw
w9i61ZkzjSNASlfefEnYNx5jNK9ol2wBabD0pLVSyA4N8NBriXzCJkapvc1nQQFi
I+kQ5Q7r
-----END PRIVATE KEY-----`;
    const teamId = process.env.APPLE_TEAM_ID;
    const clientId = process.env.APPLE_CLIENT_ID;
    const keyId = process.env.APPLE_KEY_ID;

    const claims = {
      iss: teamId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 180,
      aud: "https://appleid.apple.com",
      sub: clientId,
    };

    return jwt.sign(claims, privateKey, {
      algorithm: "ES256",
      header: { alg: "ES256", kid: keyId },
    });
  } catch (error) {
    logger.error("authControllers --> appleLoginUser --> error", error);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

// FUNCTION TO LOGIN THE USER (USING GOOGLE LOGIN)
const appleLoginUser = async (req, res) => {
  try {
    logger.info("authControllers --> appleLoginUser --> reached");
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    const client_id = process.env.APPLE_CLIENT_ID;
    const client_secret = generateAppleClientSecret();

    // Exchange authorization code for tokens
    const response = await axios({
      method: "post",
      url: "https://appleid.apple.com/auth/token",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: new URLSearchParams({
        client_id,
        client_secret,
        code,
        grant_type: "authorization_code",
      }),
    });

    const { id_token, access_token, refresh_token } = response.data;

    // Decode and verify the ID token
    const { header } = jwt.decode(id_token, { complete: true });
    const { kid } = header;
    const publicKey = await getKey(kid);

    const decodedToken = jwt.verify(id_token, publicKey, {
      algorithms: ["RS256"],
      issuer: "https://appleid.apple.com",
    });

    if (decodedToken.aud !== process.env.APPLE_CLIENT_ID) {
      return errorResponse(res, message.TOKEN.INVALID_AUDIENCE, null, 403);
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp < currentTime) {
      return errorResponse(res, message.TOKEN.TOKEN_EXPIRED, null, 401);
    }

    const { sub, email } = decodedToken;
    console.log("DECODED TOKEN ::: ", decodedToken);

    // GENERATE TOKENS
    const accessToken = generateAccessToken(sub, email);
    const refreshToken = generateRefreshToken(sub, email);

    let generatedUserName = email.split("@")[0];

    // FIND OR CREATE A NEW USER
    let user = await User.findOne({ where: { email, user_id: sub } });

    if (!user) {
      user = await User.create({
        name: generatedUserName,
        email,
        user_id: sub,
        is_google: "0",
      });
    }

    logger.info("authControllers --> appleLoginUser --> ended");
    return successResponse(
      res,
      message.TOKEN.TOKEN_VERIFIED,
      { accessToken, refreshToken, sub, email },
      200
    );
  } catch (error) {
    logger.error(`Error in apple login user: ${error.message}`);
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
      return errorResponse(res, message.TOKEN.UNAUTHORIZED_TOKEN, null, 401);
    }

    addToBlacklist(token);

    logger.info("authControllers --> logoutUser --> ended");
    return successResponse(res, message.AUTH.LOGOUT, null, 200);
  } catch (error) {
    logger.error(`Error in logout user: ${error.message}`);
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
      return errorResponse(res, message.TOKEN.UNAUTHORIZED_TOKEN, null, 427);
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = generateAccessToken(decoded.userId);

    logger.info("authControllers --> refreshAccessToken --> ended");
    return successResponse(
      res,
      message.TOKEN.TOKEN_REFRESHED,
      { accessToken: newAccessToken },
      200
    );
  } catch (error) {
    logger.error(`Error in refresh token: ${error.message}`);
    if (error.name === "TokenExpiredError") {
      logger.error("Token has expired ::: ", error);
      return errorResponse(
        res,
        message.TOKEN.REFRESH_TOKEN_EXPIRED,
        error,
        427
      );
    } else {
      logger.error("Error in verifying token ::: ", error);
      return errorResponse(res, message.TOKEN.INVALID_TOKEN, error, 403);
    }
  }
};

// FUNCTION FOR GET USER DETAIL BY ID
const getUserById = async (req, res) => {
  try {
    logger.info("authControllers --> getUserById --> reached");

    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    // Find the user by its user_id
    const user = await User.findOne({ where: { user_id: userId } });

    // If user not found, return a 404 response
    if (!user) {
      logger.warn(`User with ID: ${id} not found.`);
      return errorResponse(res, message.COMMON.NOT_FOUND, null, 404);
    }

    logger.info("authControllers --> getUserById --> ended");
    return successResponse(res, message.COMMON.FETCH_SUCCESS, user, 200);
  } catch (error) {
    logger.error(`Error in get user by user_id: ${error.message}`);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

// FUNCTION FOR UPDATE USER DETAIL BY ID
const updateUserById = async (req, res) => {
  try {
    logger.info("authControllers --> updateUserById --> reached");

    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    const { name, email } = req.body;

    // Find the user by its user_id
    const user = await User.findOne({ where: { user_id: userId } });

    // If user not found, return a 404 response
    if (!user) {
      logger.warn(`User with ID: ${id} not found.`);
      return errorResponse(res, message.COMMON.NOT_FOUND, null, 404);
    }

    // Update the user's details
    user.name = name || user.name;
    user.email = email || user.email;

    // Save the updated user details in the database
    await user.save();

    logger.info("authControllers --> updateUserById --> ended");
    return successResponse(res, message.COMMON.UPDATE_SUCCESS, user, 200);
  } catch (error) {
    logger.error(`Error in get user by user_id: ${error.message}`);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

module.exports = {
  googleLoginUser,
  appleLoginUser,
  logoutUser,
  refreshAccessToken,
  getUserById,
  updateUserById,
};
