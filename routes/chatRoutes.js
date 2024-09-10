const express = require("express");

// CONTROLLERS
const {
  chatCompletionsAI,
  chatCompletionsManual,
} = require("../controllers/chatControllers");

const router = express.Router();

router.post("/completions/ai-reply", chatCompletionsAI);

router.post("/completions/manual-reply", chatCompletionsManual);

module.exports = router;
