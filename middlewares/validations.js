const { body, validationResult } = require("express-validator");

// UTIL MODULES
const message = require("../utils/commonMessages");
const { errorResponse } = require("../utils/handleResponses");

const validateUser = [
  body("email").isEmail().withMessage("Email is invalid"),
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

const validateEvent = [
  body("name")
    .notEmpty()
    .withMessage("Event name is required")
    .isString()
    .withMessage("Event name must be a string"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("date")
    .notEmpty()
    .withMessage("Event date is required")
    .isISO8601()
    .withMessage("Event date must be a valid ISO 8601 date"),

  body("time")
    .notEmpty()
    .withMessage("Event time is required")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Event time must be a valid time in HH:mm format"),

  body("location")
    .notEmpty()
    .withMessage("Event location is required")
    .isString()
    .withMessage("Event location must be a string"),

  // Handle validation results
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

module.exports = { validateUser, validateEvent };
