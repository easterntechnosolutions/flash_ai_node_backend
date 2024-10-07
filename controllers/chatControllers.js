const axios = require("axios");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const { PassThrough } = require("stream");
const jwt = require("jsonwebtoken");
const { v4: uuid4 } = require("uuid");

// MODELS
const { Chat, Image, Chat_Reply } = require("../models");

// CORE-CONFIG MODULES
const logger = require("../core-configurations/logger-config/loggers");

// UTILS MODULES
const message = require("../utils/commonMessages");
const { successResponse, errorResponse } = require("../utils/handleResponses");

// Determine the environment (default to 'development')
const environment = process.env.NODE_ENV || "development";

// Load the appropriate .env file
dotenv.config({ path: `.env.${environment}` });

const conditionAPIKey =
  process.env.NODE_ENV === "production"
    ? process.env.OPENAI_API_KEY
    : process.env.APIKEY;

// const usedTokensForAI = new Set();
const openai = new OpenAI({
  apiKey: process.env.APIKEY,
});

// FUNCTION FOR AI REPLY
const chatCompletionsAI = async (req, res) => {
  try {
    const passThrough = new PassThrough();
    const { messages } = req.body;

    // Make a request to the OpenAI API
    const response = await axios({
      method: "post",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.APIKEY}`,
      },
      data: {
        model: "gpt-3.5-turbo",
        messages: messages,
        stream: true,
      },
      responseType: "stream",
    });

    // Pipe the streamed response to PassThrough, then to the client
    response.data.pipe(passThrough);
    passThrough.pipe(res);

    logger.info("Successfully connected to OpenAI API and streaming data.");
  } catch (error) {
    logger.error(`Error in AI reply chat completions: ${error.message}`);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

// FUNCTION FOR MANUAL REPLY
const chatCompletionsManual = async (req, res) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    const { messages, chat, chatId } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    // Stream and process the completion
    const response = completion.choices[0];

    const responseObj = {
      reply: response.message.content,
    };

    // AFTER SUCCESSFULL RESPONSE DATA SHOULD ADDED ON HISTORY
    let uniqueId;
    if (responseObj) {
      uniqueId = chatId || uuid4();
      if (chatId === null) {
        // FIRST BULK INSERT CHAT MESSAGES
        const updatedChat = chat.map((chatItem) => ({
          ...chatItem,
          chat_id: uniqueId,
          user_id: userId,
        }));
        await Chat.bulkCreate(updatedChat);

        // SECOND INSERT CHAT REPLY
        await Chat_Reply.create({
          chat_id: uniqueId,
          reply: responseObj.reply,
        });
      } else {
        uniqueId = chatId;

        // INSERT CHAT REPLY
        await Chat_Reply.create({
          chat_id: uniqueId,
          reply: responseObj.reply,
        });
      }
    }

    // Update responseObj to include chatId (uniqueId)
    const updatedResponseObj = {
      reply: responseObj.reply,
      chatId: uniqueId,
      user_id: userId,
    };

    return successResponse(
      res,
      message.COMMON.CREATE_SUCCESS,
      updatedResponseObj,
      200
    );
  } catch (error) {
    logger.error(`Error in Manual reply chat completions: ${error.message}`);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

// FUNCTION FOR IMAGE REPLY
const chatCompletionsImage = async (req, res) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    const { messages, chatId } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
    });

    // Stream and process the completion
    const response = completion.choices[0];
    const responseObj = {
      reply: response.message.content,
    };

    // AFTER SUCCESSFULL RESPONSE DATA SHOULD ADDED ON HISTORY
    let uniqueId;
    let imageUrl = null;
    if (responseObj) {
      uniqueId = chatId || uuid4();
      if (chatId === null) {
        // FIRST BULK INSERT CHAT MESSAGES
        for (const message of messages) {
          if (message.role === "user" && Array.isArray(message.content)) {
            for (const contentItem of message.content) {
              if (
                contentItem.type === "image_url" &&
                contentItem.image_url &&
                contentItem.image_url.url
              ) {
                imageUrl = contentItem.image_url.url;
                break;
              }
            }
          }
          if (imageUrl) break;
        }
        await Image.create({
          chat_id: uniqueId,
          image_url: imageUrl,
          user_id: userId,
        });

        // // SECOND INSERT CHAT REPLY
        await Chat_Reply.create({
          chat_id: uniqueId,
          reply: responseObj.reply,
        });
      } else {
        uniqueId = chatId;

        // INSERT CHAT REPLY
        await Chat_Reply.create({
          chat_id: uniqueId,
          reply: responseObj.reply,
        });
      }
    }

    // Update responseObj to include chatId (uniqueId)
    const updatedResponseObj = {
      reply: responseObj.reply,
      chatId: uniqueId,
      user_id: userId,
    };

    return successResponse(
      res,
      message.COMMON.CREATE_SUCCESS,
      updatedResponseObj,
      200
    );
  } catch (error) {
    logger.error(`Error in Image reply chat completions: ${error.message}`);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

module.exports = {
  chatCompletionsAI,
  chatCompletionsManual,
  chatCompletionsImage,
};
