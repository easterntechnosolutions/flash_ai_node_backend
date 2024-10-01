const express = require("express");

// MIDDLEWARES
const { validateEvent } = require("../middlewares/validations");

// CONTROLLERS
const {
  createNewEvents,
  getAllEvents,
  getEventById,
  getEventByUserId,
} = require("../controllers/eventControllers");

const router = express.Router();

router.post("/create-event", validateEvent, createNewEvents);
router.get("/", getAllEvents);
router.get("/get-by-userid", getEventByUserId);
router.get("/:id", getEventById);

module.exports = router;
