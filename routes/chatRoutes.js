const express = require("express");

// CONTROLLERS
const {
  chatCompletionsAI,
  chatCompletionsManual,
  chatCompletionsImage,
} = require("../controllers/chatControllers");

const router = express.Router();

router.post("/completions/ai-reply", chatCompletionsAI);
router.post("/completions/manual-reply", chatCompletionsManual);
router.post("/completions/image-reply", chatCompletionsImage);

module.exports = router;
