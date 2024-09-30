const express = require("express");

// MIDDLEWARES
const { validateEvent } = require("../middlewares/validations");

// CONTROLLERS
const {
  createNewEvents,
  getAllEvents,
} = require("../controllers/eventControllers");

const router = express.Router();

router.post("/create-event", validateEvent, createNewEvents);
router.get("/", getAllEvents);

module.exports = router;
