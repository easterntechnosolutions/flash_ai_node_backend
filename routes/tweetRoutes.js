const express = require("express");

// CONTROLLERS
const { getAllTweets } = require("../controllers/tweetControllers");

const router = express.Router();

router.post("/get_all_tweets", getAllTweets);

module.exports = router;
