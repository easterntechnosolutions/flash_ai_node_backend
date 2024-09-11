const express = require("express");

// CONTROLLERS
const {
  getAllHistory,
  getManualTextHistoryById,
  getImageTextHistoryById,
} = require("../controllers/historyControllers");

const router = express.Router();

router.get("/", getAllHistory);
router.get("/manual/:id", getManualTextHistoryById);
router.get("/image/:id", getImageTextHistoryById);

module.exports = router;
