const axios = require("axios");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const { PassThrough } = require("stream");

// CORE-CONFIG MODULES
const logger = require("../core-configurations/logger-config/loggers");

// UTILS MODULES
const message = require("../utils/commonMessages");
const { errorResponse } = require("../utils/handleResponses");

dotenv.config();

// const usedTokensForAI = new Set();
const openai = new OpenAI({
  apiKey: process.env.APIKEY,
});

// FUNCTION FOR AI REPLY
const chatCompletionsAI = async (req, res) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
      return errorResponse(res, message.AUTH.UNAUTHORIZED_TOKEN, null, 401);
    }

    // if (usedTokensForAI.has(token)) {
    //   return errorResponse(res, message.AUTH.INVALID_TOKEN, null, 401);
    // }

    // usedTokensForAI.add(token);

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
    console.log("ERROR IN AI REPLY CHAT COMPLETIONS ::: ", error);
  }
};

// FUNCTION FOR MANUAL REPLY
const chatCompletionsManual = async (req, res) => {
  try {
    const { messages } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    // Stream and process the completion
    const response = completion.choices[0];
    const responseObj = {
      index: response.index,
      message: response.message,
    };
    return res.status(200).json({ data: responseObj });
  } catch (error) {
    console.log("ERROR IN MANUAL REPLY CHAT COMPLETIONS ::: ", error);
  }
};

module.exports = { chatCompletionsAI, chatCompletionsManual };
