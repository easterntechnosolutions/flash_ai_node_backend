const express = require("express");

// CONTROLLERS
const {
  googleLoginUser,
  appleLoginUser,
  logoutUser,
  refreshAccessToken,
  getUserById,
  updateUserById,
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

// FOR USER
router.get("/", getUserById);
router.put("/", updateUserById);

module.exports = router;
