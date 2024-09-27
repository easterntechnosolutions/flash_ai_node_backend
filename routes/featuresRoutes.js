const express = require("express");

// CONTROLLERS
const {
  dateMateAI,
  virtualDateAI,
  localDateEventsFinderAI,
  profileBuilderAI,
} = require("../controllers/featuresControllers");

const router = express.Router();

router.post("/date-mate", dateMateAI);
router.post("/lets-date", virtualDateAI);
router.post("/local-events-finder", localDateEventsFinderAI);
router.post("/profile-builder", profileBuilderAI);

module.exports = router;
