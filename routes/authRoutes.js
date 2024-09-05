const express = require("express");

// CONTROLLERS
const {
  loginUser,
  logoutUser,
  refreshAccessToken,
} = require("../controllers/authControllers");

// MIDDLEWARE
const { validateUser } = require("../middlewares/validations");

const router = express.Router();

router.post("/login", validateUser, loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshAccessToken);

module.exports = router;
