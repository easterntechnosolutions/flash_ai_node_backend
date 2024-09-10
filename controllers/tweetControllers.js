const axios = require("axios");
const dotenv = require("dotenv");

// CORE-CONFIG MODULES
const logger = require("../core-configurations/logger-config/loggers");

// UTILS MODULES
const message = require("../utils/commonMessages");
const { errorResponse, successResponse } = require("../utils/handleResponses");

dotenv.config();

// FUNCTION FOR AI REPLY
const getAllTweets = async (req, res) => {
  try {
    logger.info("tweetControllers --> getAllTweets --> reached");

    const response = await axios({
      method: "post",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.APIKEY}`,
      },
      data: {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a creative assistant that generates clever and funny pickup lines.",
          },
          {
            role: "user",
            content:
              "Please generate 10 clever and funny pickup lines. please be uniqu everytime you give generic pick up lines",
          },
        ],
      },
    });

    const aiResponses = response.data.choices.flatMap((choice) => {
      let lines = choice.message.content
        .split("\n")
        .filter((line) => line.trim() !== "");

      lines = lines.map((line) => line.replace(/^\d+\.\s*/, ""));

      return lines;
    });

    logger.info("tweetControllers --> getAllTweets --> ended");

    return successResponse(
      res,
      message.COMMON.LIST_FETCH_SUCCESS,
      aiResponses,
      200
    );
  } catch (error) {
    logger.error("tweetControllers --> getAllTweets --> error", error);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

module.exports = { getAllTweets };
