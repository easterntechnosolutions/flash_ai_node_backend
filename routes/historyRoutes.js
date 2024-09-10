const express = require("express");

// CONTROLLERS
const {
  getManualTextHistoryById,
  deleteHistory,
} = require("../controllers/historyControllers");

const router = express.Router();

router.get("/:id", getManualTextHistoryById);
router.delete("/:id", deleteHistory);

module.exports = router;
