const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const jwksClient = require("jwks-rsa");

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

// FUNCTION TO LOGIN THE USER (USING GOOGLE LOGIN)
const googleLoginUser = async (req, res) => {
  try {
    logger.info("authControllers --> googleLoginUser --> reached");

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

    logger.info("authControllers --> googleLoginUser --> ended");
    return successResponse(res, message.AUTH.VERIFIED_USER, userData, 200);
  } catch (error) {
    logger.error("authControllers --> googleLoginUser --> error", error);
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

    // FIND OR CREATE A NEW USER
    let user = await User.findOne({ where: { email } });

    let generatedUserName = email.split("@")[0];

    if (!user) {
      user = await User.create({
        name: generatedUserName,
        email,
        user_id: sub,
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
    logger.error("authControllers --> appleLoginUser --> error", error);
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
    logger.error("authControllers --> refreshAccessToken --> error", error);
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
module.exports = {
  googleLoginUser,
  appleLoginUser,
  logoutUser,
  refreshAccessToken,
};
