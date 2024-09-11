// MODELS
const { History, sequelize } = require("../models");

// CORE CONFIG
const logger = require("../core-configurations/logger-config/loggers");

// UTILS
const { successResponse, errorResponse } = require("../utils/handleResponses");
const message = require("../utils/commonMessages");

// FUNCTION TO GET ALL LIST OF HISTORY
const getAllHistory = async (req, res) => {
  try {
    logger.info("historyControllers --> getAllHistory --> reached");

    // First Query: Fetch data for chat_id where images and chat replies exist
    const imageData = await sequelize.query(
      `SELECT i.chat_id, i.image_url, cr.reply
       FROM Images i
       LEFT JOIN Chat_Replies cr ON i.chat_id = cr.chat_id
       ORDER BY i.chat_id`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Second Query: Fetch data for chat_id where chats and chat replies exist
    const chatData = await sequelize.query(
      `SELECT c.chat_id, c.message, cr.reply
       FROM Chats c
       LEFT JOIN Chat_Replies cr ON c.chat_id = cr.chat_id
       ORDER BY c.chat_id, c.sequence`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Process the data for Images and combine replies
    let imageResponse = {};
    imageData.forEach((item) => {
      if (!imageResponse[item.chat_id]) {
        imageResponse[item.chat_id] = {
          chatId: item.chat_id,
          image: item.image_url,
        };
      }
    });

    // Process the data for Chats and Replies
    let chatResponse = {};
    chatData.forEach((item) => {
      if (!chatResponse[item.chat_id]) {
        chatResponse[item.chat_id] = {
          chatId: item.chat_id,
          chats: new Set(),
          replies: new Set(),
        };
      }

      // Add chat message
      if (item.message) {
        chatResponse[item.chat_id].chats.add(item.message);
      }

      // Add reply if it exists
      if (item.reply) {
        chatResponse[item.chat_id].replies.add(item.reply);
      }
    });

    // Combine both responses into one
    const finalResponse = [];

    // Process Image data response
    Object.values(imageResponse).forEach((imageData) => {
      finalResponse.push({
        chatId: imageData.chatId,
        image: imageData.image,
      });
    });

    // Process Chat data response
    Object.values(chatResponse).forEach((chatData) => {
      finalResponse.push({
        chatId: chatData.chatId,
        chats: Array.from(chatData.chats),
        replies: Array.from(chatData.replies),
      });
    });

    logger.info("historyControllers --> getAllHistory --> ended");
    return successResponse(
      res,
      message.COMMON.LIST_FETCH_SUCCESS,
      finalResponse,
      200
    );
  } catch (error) {
    logger.error("historyControllers --> getAllHistory --> error", error);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

// FUNCTION TO GET MANUAL TEXT HISTORY BY ID
const getManualTextHistoryById = async (req, res) => {
  try {
    logger.info("historyControllers --> getManualTextHistoryById --> reached");

    const { id } = req.params;

    // Manually perform an LEFT JOIN between Chat and Chat_Reply using raw SQL
    const chatData = await sequelize.query(
      `SELECT c.chat_id, c.message, c.me, c.sequence, cr.reply
       FROM Chats c
       LEFT JOIN Chat_Replies cr ON c.chat_id = cr.chat_id
       WHERE c.chat_id = :chat_id`,
      {
        replacements: { chat_id: id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!chatData.length) {
      return errorResponse(res, message.COMMON.NOT_FOUND, null, 404);
    }

    // Extract chat information and chat replies into separate arrays
    const chats = [];
    const chatReplies = [];

    // Use sets to track unique chats and replies
    const chatSet = new Set();
    const replySet = new Set();

    chatData.forEach((row) => {
      if (!chatSet.has(row.sequence)) {
        chats.push({
          message: row.message,
          me: row.me,
          sequence: row.sequence,
        });
        chatSet.add(row.sequence);
      }

      if (row.reply && !replySet.has(row.reply)) {
        chatReplies.push(row.reply);
        replySet.add(row.reply);
      }
    });

    // Construct the final response object
    const responseObj = {
      chatId: id,
      chats,
      chatReplies,
    };

    logger.info("historyControllers --> getManualTextHistoryById --> ended");
    return successResponse(res, message.COMMON.FETCH_SUCCESS, responseObj, 200);
  } catch (error) {
    logger.error(
      "historyControllers --> getManualTextHistoryById --> error",
      error
    );
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

// FUNCTION TO GET IMAGE TEXT HISTORY BY ID
const getImageTextHistoryById = async (req, res) => {
  try {
    logger.info("historyControllers --> getImageTextHistoryById --> reached");

    const { id } = req.params;

    // Manually perform an LEFT JOIN between Chat and Chat_Reply using raw SQL
    const imageData = await sequelize.query(
      `SELECT i.chat_id, i.image_url, cr.reply
       FROM Images i
       LEFT JOIN Chat_Replies cr ON i.chat_id = cr.chat_id
       WHERE i.chat_id = :chat_id`,
      {
        replacements: { chat_id: id },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    console.lo;

    if (!imageData.length) {
      return errorResponse(res, message.COMMON.NOT_FOUND, null, 404);
    }

    // Extract image information and chat replies into separate arrays
    const images = [];
    const chatReplies = [];

    // Use sets to track unique chats and replies
    const imageSet = new Set();
    const replySet = new Set();

    imageData.forEach((row) => {
      // Only add the image url if it's not already added
      if (!imageSet.has(row.sequence)) {
        images.push({
          image_url: row.image_url,
        });
        imageSet.add(row.sequence);
      }

      // Add reply if it's not null or undefined
      if (row.reply && !replySet.has(row.reply)) {
        chatReplies.push(row.reply);
        replySet.add(row.reply);
      }
    });

    // Construct the final response object
    const responseObj = {
      chatId: id,
      images,
      chatReplies,
    };

    logger.info("historyControllers --> getImageTextHistoryById --> ended");
    return successResponse(res, message.COMMON.FETCH_SUCCESS, responseObj, 200);
  } catch (error) {
    logger.error(
      "historyControllers --> getImageTextHistoryById --> error",
      error
    );
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

module.exports = {
  getAllHistory,
  getManualTextHistoryById,
  getImageTextHistoryById,
};
