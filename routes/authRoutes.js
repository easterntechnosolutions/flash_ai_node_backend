const express = require("express");

// CONTROLLERS
const {
  googleLoginUser,
  appleLoginUser,
  logoutUser,
  refreshAccessToken,
} = require("../controllers/authControllers");

// MIDDLEWARE
const { validateUser } = require("../middlewares/validations");

const router = express.Router();

// FOR GOOGLE LOGIN
router.post("/google-login", validateUser, googleLoginUser);

// FOR APPLE LOGIN
router.post("/apple-login", appleLoginUser);

router.post("/logout", logoutUser);
router.post("/refresh-token", refreshAccessToken);

module.exports = router;
