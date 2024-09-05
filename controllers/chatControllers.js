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

const usedTokensForAI = new Set();
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

    if (usedTokensForAI.has(token)) {
      return errorResponse(res, message.AUTH.INVALID_TOKEN, null, 401);
    }

    usedTokensForAI.add(token);

    const passThrough = new PassThrough();

    // Make a request to the OpenAI API
    axios({
      method: "post",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.APIKEY}`,
      },
      data: {
        model: req.model ?? "gpt-3.5-turbo-1106",
        messages: req.body.messages,
        stream: true,
      },
      responseType: "stream",
    })
      .then((response) => {
        response.data.pipe(passThrough);
      })
      .catch((error) => {
        console.error(error);
        passThrough.on("error", (error) => {
          console.error(error);
          res.status(500).send("Internal Server Error");
        });
      });

    logger.info("Successfully connected to OpenAI API.");

    // Forward the streamed data to the client
    passThrough.pipe(res);
  } catch (error) {
    console.log("ERROR IN AI REPLY CHAT COMPLETIONS ::: ", error);
  }
};

// FUNCTION FOR MANUAL REPLY
const chatCompletionsManual = async (req, res) => {
  try {
    const { text } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: text },
      ],
      stream: true,
      headers: {
        Authorization: `Bearer ${process.env.APIKEY}`,
      },
    });

    // Stream and process the completion
    for await (const chunk of completion) {
      console.log(chunk.choices[0].delta.content);
      return res.status(200).json({ data: chunk.choices[0].delta.content });
    }
  } catch (error) {
    console.log("ERROR IN MANUAL REPLY CHAT COMPLETIONS ::: ", error);
  }
};

module.exports = { chatCompletionsAI, chatCompletionsManual };
