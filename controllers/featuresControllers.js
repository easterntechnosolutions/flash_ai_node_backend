const axios = require("axios");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const { PassThrough } = require("stream");

// CORE-CONFIG MODULES
const logger = require("../core-configurations/logger-config/loggers");

// UTILS MODULES
const message = require("../utils/commonMessages");
const { successResponse, errorResponse } = require("../utils/handleResponses");

// Determine the environment (default to 'development')
const environment = process.env.NODE_ENV || "development";

// Load the appropriate .env file
dotenv.config({ path: `.env.${environment}` });

const apiKey =
  process.env.NODE_ENV === "production"
    ? process.env.OPENAI_API_KEY
    : process.env.APIKEY;

// FUNCTION FOR DATE MATE AI
const dateMateAI = async (req, res) => {
  try {
    logger.info("featuresControllers --> dateMateAI --> reached");
    const passThrough = new PassThrough();
    const { messages } = req.body;

    // if (!messages || !Array.isArray(messages) || messages.length === 0) {
    //   return errorResponse(res, "Invalid messages format", null, 403);
    // }

    const defaultUserMessage = {
      role: "user",
      content:
        "Can you give me the best date ideas for a romantic evening? I want it to be unforgettable!",
    };

    const defaultSystemMessage = {
      role: "system",
      content:
        "As a DateMate assistant, your role is to suggest creative date ideas while also recommending better locations based on the user's preferences. " +
        "Could you refine this process and ensure the suggestions are personalized and engaging?",
    };

    // Make a request to the OpenAI API
    const response = await axios({
      method: "post",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      data: {
        model: "gpt-4o-mini",
        messages: messages || [defaultUserMessage, defaultSystemMessage],
        stream: true,
      },
      responseType: "stream",
    });

    // Pipe the streamed response to PassThrough, then to the client
    response.data.pipe(passThrough);
    passThrough.pipe(res);

    logger.info("featuresControllers --> dateMateAI --> ended");
  } catch (error) {
    logger.error(`Error in Date Mate AI: ${error.message}`);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

// FUNCTION FOR VIRTUAL DATE AI
const virtualDateAI = async (req, res) => {
  try {
    logger.info("featuresControllers --> virtualDateAI --> reached");

    const { messages } = req.body;

    const defaultUserMessage = {
      role: "user",
      content:
        "Hi, Let's Date! Can you help me by starting a virtual date? Let’s make it fun and engaging!",
    };

    const defaultSystemMessage = {
      role: "system",
      content:
        "As the Let's Date assistant, your role is to engage the user in a simulated date conversation aimed at improving their conversational skills. " +
        "Your goal is to create an interactive, natural dialogue that helps the user practice and develop better communication techniques, fostering a comfortable and enjoyable experience.",
    };

    const response = await axios({
      method: "post",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      data: {
        model: "gpt-4o-mini",
        messages: messages || [defaultUserMessage, defaultSystemMessage],
      },
    });

    const aiResponses = response.data.choices.flatMap((choice) => {
      let lines = choice.message.content
        .split("|")
        .filter((line) => line.trim() !== "");

      lines = lines.map((line) => line.replace(/^\d+\.\s*/, ""));

      return lines;
    });

    logger.info("featuresControllers --> virtualDateAI --> ended");
    return successResponse(res, message.COMMON.FETCH_SUCCESS, aiResponses, 200);
  } catch (error) {
    logger.error(`Error in Virtual Date AI: ${error.message}`);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

// FUNCTION FOR LOCAL EVENTS FINDER AI
const localDateEventsFinderAI = async (req, res) => {
  try {
    logger.info("featuresControllers --> localDateEventsFinderAI --> reached");

    const { messages } = req.body;

    const defaultUserMessage = {
      role: "user",
      content: "Hi, What's Happening Near Me in this weekend?!",
    };

    const defaultSystemMessage = {
      role: "system",
      content:
        "As the Local Events Finder assistant, your role is to assist the user in discovering nearby events based on their preferences. " +
        "Your goal is to provide personalized event recommendations and engage the user in a natural conversation, " +
        "helping them find exciting activities while fostering an enjoyable and informative experience.",
    };

    const response = await axios({
      method: "post",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      data: {
        model: "gpt-4o-mini",
        messages: messages || [defaultUserMessage, defaultSystemMessage],
      },
    });

    const aiResponses = response.data.choices.flatMap((choice) => {
      let lines = choice.message.content
        .split("|")
        .filter((line) => line.trim() !== "");

      lines = lines.map((line) => line.replace(/^\d+\.\s*/, ""));

      return lines;
    });

    logger.info("featuresControllers --> localDateEventsFinderAI --> ended");
    return successResponse(res, message.COMMON.FETCH_SUCCESS, aiResponses, 200);
  } catch (error) {
    logger.error(`Error in Virtual Date AI: ${error.message}`);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

// FUNCTION FOR PROFILE BUILDER AI
const profileBuilderAI = async (req, res) => {
  try {
    logger.info("featuresControllers --> profileBuilderAI --> reached");

    const { messages } = req.body;

    const defaultUserMessage = {
      role: "user",
      content:
        "Hi, I need help building my dating profile! Can you guide me on how to showcase my personality, interests, and " +
        "what I’m looking for in a partner? I want my profile to stand out but also feel authentic.",
    };

    const defaultSystemMessage = {
      role: "system",
      content:
        "As the Dating Profile Builder assistant, your role is to help the user craft an engaging and personalized dating profile. " +
        "Your goal is to guide the user through the process of highlighting their unique qualities, interests, and preferences in a way that fosters meaningful connections. " +
        "Ensure the conversation is interactive, offering valuable tips and suggestions to make their profile stand out while maintaining an authentic and relatable tone.",
    };

    const response = await axios({
      method: "post",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      data: {
        model: "gpt-4o-mini",
        messages: messages || [defaultUserMessage, defaultSystemMessage],
      },
    });

    const aiResponses = response.data.choices.flatMap((choice) => {
      let lines = choice.message.content
        .split("|")
        .filter((line) => line.trim() !== "");

      lines = lines.map((line) => line.replace(/^\d+\.\s*/, ""));

      return lines;
    });

    logger.info("featuresControllers --> profileBuilderAI --> ended");
    return successResponse(res, message.COMMON.FETCH_SUCCESS, aiResponses, 200);
  } catch (error) {
    logger.error(`Error in Virtual Date AI: ${error.message}`);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

// FUNCTION FOR BEST MATCH FINDER AI
const bestMatchFinderAI = async (req, res) => {
  try {
    logger.info("featuresControllers --> bestMatchFinderAI --> reached");

    const { messages } = req.body;

    const defaultUserMessage = {
      role: "user",
      content:
        "Hi, I'm looking for help finding the best match for me. I want someone who shares similar interests, values, and life goals. " +
        "Can you help me analyze my preferences and suggest the ideal match?",
    };

    const defaultSystemMessage = {
      role: "system",
      content:
        "As the Best Match Finder assistant, your role is to help the user identify potential matches based on their unique preferences, values, and interests. " +
        "Your goal is to offer suggestions and advice that help the user find meaningful connections. Make sure the conversation is interactive, " +
        "offering personalized suggestions while ensuring the user's preferences are analyzed thoroughly.",
    };

    // Send the user preferences along with the messages
    const response = await axios({
      method: "post",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      data: {
        model: "gpt-4o-mini",
        messages: messages || [defaultUserMessage, defaultSystemMessage],
      },
    });

    const aiResponses = response.data.choices.flatMap((choice) => {
      let lines = choice.message.content
        .split("|")
        .filter((line) => line.trim() !== "");

      lines = lines.map((line) => line.replace(/^\d+\.\s*/, ""));

      return lines;
    });

    logger.info("featuresControllers --> bestMatchFinderAI --> ended");
    return successResponse(res, message.COMMON.FETCH_SUCCESS, aiResponses, 200);
  } catch (error) {
    logger.error(`Error in Best Match Finder AI: ${error.message}`);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

module.exports = {
  dateMateAI,
  virtualDateAI,
  localDateEventsFinderAI,
  profileBuilderAI,
  bestMatchFinderAI,
};
