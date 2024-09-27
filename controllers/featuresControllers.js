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

// const usedTokensForAI = new Set();
const openai = new OpenAI({
  apiKey: process.env.APIKEY,
});

// FUNCTION FOR DATE MATE AI
const dateMateAI = async (req, res) => {
  try {
    logger.info("featuresControllers --> dateMateAI --> reached");
    const passThrough = new PassThrough();
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return errorResponse(res, "Invalid messages format", null, 403);
    }

    // Make a request to the OpenAI API
    const response = await axios({
      method: "post",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.APIKEY}`,
      },
      data: {
        model: "gpt-4o-mini",
        messages: messages,
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
        "As the Let's Date assistant, your role is to engage the user in a simulated date conversation aimed at improving their conversational skills. Your goal is to create an interactive, natural dialogue that helps the user practice and develop better communication techniques, fostering a comfortable and enjoyable experience.",
    };

    const response = await axios({
      method: "post",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.APIKEY}`,
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
        "As the Local Events Finder assistant, your role is to assist the user in discovering nearby events based on their preferences. Your goal is to provide personalized event recommendations and engage the user in a natural conversation, helping them find exciting activities while fostering an enjoyable and informative experience.",
    };

    const response = await axios({
      method: "post",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.APIKEY}`,
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
        "Hi, I need help building my dating profile! Can you guide me on how to showcase my personality, interests, and what I’m looking for in a partner? I want my profile to stand out but also feel authentic.",
    };

    const defaultSystemMessage = {
      role: "system",
      content:
        "As the Dating Profile Builder assistant, your role is to help the user craft an engaging and personalized dating profile. Your goal is to guide the user through the process of highlighting their unique qualities, interests, and preferences in a way that fosters meaningful connections. Ensure the conversation is interactive, offering valuable tips and suggestions to make their profile stand out while maintaining an authentic and relatable tone.",
    };

    const response = await axios({
      method: "post",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.APIKEY}`,
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

module.exports = {
  dateMateAI,
  virtualDateAI,
  localDateEventsFinderAI,
  profileBuilderAI,
};
