const express = require("express");

// CONTROLLERS
const {
  chatCompletionsAI,
  chatCompletionsManual,
} = require("../controllers/chatControllers");

const router = express.Router();

router.post("/completions/ai_reply", chatCompletionsAI);

router.post("/completions/manual_reply", chatCompletionsManual);

module.exports = router;
