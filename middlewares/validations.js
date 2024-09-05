const { body, validationResult } = require("express-validator");

// UTIL MODULES
const message = require("../utils/commonMessages");
const { errorResponse } = require("../utils/handleResponses");

// MODELS
const { User } = require("../models");

const validateUser = [
  body("email")
    .isEmail()
    .withMessage("Email is invalid")
    .custom(async (email) => {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error("Email already in use");
      }
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(
        res,
        message.AUTH.INVALID_FORMAT,
        errors.array(),
        400
      );
    }
    next();
  },
];

module.exports = { validateUser };
