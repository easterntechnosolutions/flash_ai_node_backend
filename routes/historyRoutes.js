const express = require("express");

// CONTROLLERS
const {
  getAllHistory,
  getManualTextHistoryById,
  getImageTextHistoryById,
  deleteHistory,
} = require("../controllers/historyControllers");

const router = express.Router();

router.get("/", getAllHistory);
router.get("/manual/:id", getManualTextHistoryById);
router.get("/image/:id", getImageTextHistoryById);
router.delete("/:id", deleteHistory);

module.exports = router;
