const express = require("express");

// CONTROLLERS
const {
  getAllHistory,
  getManualTextHistoryById,
  deleteHistory,
} = require("../controllers/historyControllers");

const router = express.Router();

router.get("/", getAllHistory);
router.get("/:id", getManualTextHistoryById);
router.delete("/:id", deleteHistory);

module.exports = router;
