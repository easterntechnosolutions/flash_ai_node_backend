const express = require("express");

// CONTROLLERS
const {
  createHistory,
  getAllHistory,
  deleteHistory,
} = require("../controllers/historyControllers");

const router = express.Router();

router.post("/create-history", createHistory);
router.get("/", getAllHistory);
router.delete("/:id", deleteHistory);

module.exports = router;
