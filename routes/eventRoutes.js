const express = require("express");

// MIDDLEWARES
const { validateEvent } = require("../middlewares/validations");

// CONTROLLERS
const {
  createNewEvents,
  getAllEvents,
  getEventById,
} = require("../controllers/eventControllers");

const router = express.Router();

router.post("/create-event", validateEvent, createNewEvents);
router.get("/", getAllEvents);
router.get("/:id", getEventById);

module.exports = router;
