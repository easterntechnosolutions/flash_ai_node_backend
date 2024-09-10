const express = require("express");

// CONTROLLERS
const { getAllTweets } = require("../controllers/tweetControllers");

const router = express.Router();

router.get("/", getAllTweets);

module.exports = router;
