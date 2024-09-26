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
            role: "user",
            content:
              "Please generate 10 clever and funny pickup lines, do not add any prefix or suffix. Separate each pick up line by a | symbol",
          },
          {
            role: "system",
            content:
              "You, as a Dating Coach, Suggest a good pickup line. must apply an individual approach to each client, uphold professional ethics and confidentiality, boost clients' confidence, and develop their communication skills while providing objective feedback. It is essential for you to flexibly adapt your teaching methods, assist clients in setting goals, and continuously self-improve by studying new approaches and research. You should teach clients how to resolve conflicts and support them at every step of the process, ensuring their motivation and support in their quest to improve their personal lives. DO NOT REPLY IF ANYTHING TECHNICAL IS ASKED IN THIS CHAT ONLY TALK ABOUT LOVE.",
          },
        ],
      },
    });

    const aiResponses = response.data.choices.flatMap((choice) => {
      let lines = choice.message.content
        .split("|")
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
    logger.error(`Error in get all tweets: ${error.message}`);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

module.exports = { getAllTweets };
