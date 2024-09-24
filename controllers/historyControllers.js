// MODELS
const { Chat, Image, Chat_Reply, sequelize } = require("../models");

// CORE CONFIG
const logger = require("../core-configurations/logger-config/loggers");

// UTILS
const { successResponse, errorResponse } = require("../utils/handleResponses");
const message = require("../utils/commonMessages");

const jwt = require("jsonwebtoken");

// FUNCTION TO GET ALL LIST OF HISTORY WITH CHAT AND IMAGE DATA
const getAllHistory = async (req, res) => {
  try {
    logger.info("historyControllers --> getAllHistory --> reached");

    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    const { page = 1, pageSize = 10 } = req.query;
    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;

    // Perform outer join between Chats and Images using UNION with pagination
    const historyData = await sequelize.query(
      `SELECT c.chat_id, 
              GROUP_CONCAT(c.message ORDER BY c.sequence SEPARATOR ', ') AS messages,
              i.image_url
       FROM Chats c
       LEFT JOIN Images i ON c.chat_id = i.chat_id
       LEFT JOIN Users u ON u.user_id = c.user_id 
       WHERE u.user_id = '${userId}'  
       GROUP BY c.chat_id, i.image_url
       
       UNION

       SELECT i.chat_id, 
              NULL AS messages,
              i.image_url
       FROM Images i
       LEFT JOIN Users u ON u.user_id = i.user_id
       LEFT JOIN Chats c ON i.chat_id = c.chat_id
       WHERE u.user_id = '${userId}' AND c.chat_id IS NULL
       
       ORDER BY chat_id
       LIMIT :limit OFFSET :offset`,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: { limit, offset },
      }
    );

    // Count total records for pagination meta-data
    const totalCountResult = await sequelize.query(
      `SELECT COUNT(*) AS totalCount FROM (
          SELECT c.chat_id
          FROM Chats c
          LEFT JOIN Images i ON c.chat_id = i.chat_id
          LEFT JOIN Users u ON u.user_id = c.user_id  -- Join Chats with Users
          WHERE u.user_id = '${userId}'  -- Filter by user_id
          GROUP BY c.chat_id, i.image_url
          
          UNION
          
          SELECT i.chat_id
          FROM Images i
          LEFT JOIN Users u ON u.user_id = i.user_id  -- Join Images with Users
          LEFT JOIN Chats c ON i.chat_id = c.chat_id
          WHERE u.user_id = '${userId}' AND c.chat_id IS NULL  -- Filter by user_id
      ) AS total`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const totalRecords = totalCountResult[0].totalCount;

    // Process the data to format the response
    const finalResponse = historyData.map((item) => {
      const chatResponse = {
        chatId: item.chat_id,
      };

      // Conditionally add chats if messages exist
      if (item.messages && item.messages.length > 0) {
        chatResponse.chats = item.messages.split(", ").map((msg) => msg.trim());
      }

      // Include image if available
      if (item.image_url) {
        chatResponse.image = item.image_url;
      }

      return chatResponse;
    });

    // Prepare paginated response
    const responseData = {
      histories: finalResponse,
      total: totalRecords,
      page: parseInt(page, 10),
      pageSize: limit,
    };

    logger.info("historyControllers --> getAllHistory --> ended");
    return successResponse(
      res,
      message.COMMON.LIST_FETCH_SUCCESS,
      responseData,
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

    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    const { id } = req.params;

    // Manually perform an LEFT JOIN between Chat and Chat_Reply using raw SQL
    const chatData = await sequelize.query(
      `SELECT c.chat_id, c.message, c.me, c.sequence, cr.reply
       FROM Chats c
       LEFT JOIN Chat_Replies cr ON c.chat_id = cr.chat_id
       WHERE c.chat_id = :chat_id AND c.user_id = '${userId}'`,
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

    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    const { id } = req.params;

    // Manually perform an LEFT JOIN between Chat and Chat_Reply using raw SQL
    const imageData = await sequelize.query(
      `SELECT i.chat_id, i.image_url, cr.reply
       FROM Images i
       LEFT JOIN Chat_Replies cr ON i.chat_id = cr.chat_id
       WHERE i.chat_id = :chat_id AND i.user_id = '${userId}'`,
      {
        replacements: { chat_id: id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

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

// FUNCTION TO DELETE THE HISTORY BY CHAT ID
const deleteHistory = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    logger.info("historyControllers --> deleteHistory --> reached");

    const { id } = req.params;

    // FIRST DELETE DATA FROM CHAT TABLE
    let chatResult = await Chat.findAll({
      where: {
        chat_id: id,
      },
    });
    if (chatResult && chatResult.length > 0) {
      // Proceed to delete if the record exists
      await Chat.destroy({
        where: { chat_id: id },
        transaction,
      });
    }

    // SECOND DELETE DATA FROM IMAGE TABLE
    let imageResult = await Image.findAll({
      where: {
        chat_id: id,
      },
    });
    if (imageResult && imageResult.length > 0) {
      // Proceed to delete if the record exists
      await Image.destroy({
        where: { chat_id: id },
        transaction,
      });
    }

    // THIRD DELETE DATA FROM CHAT_REPLY TABLE
    let chatReplyResult = await Chat_Reply.findAll({
      where: {
        chat_id: id,
      },
    });
    if (chatReplyResult && chatReplyResult.length > 0) {
      // Proceed to delete if the record exists
      await Chat_Reply.destroy({
        where: { chat_id: id },
        transaction,
      });
    }

    // Commit the transaction if no errors
    await transaction.commit();

    logger.info("historyControllers --> deleteHistory --> ended");
    return successResponse(res, message.COMMON.DELETE_SUCCESS, null, 200);
  } catch (error) {
    // Rollback the transaction in case of an error
    await transaction.rollback();

    logger.error("historyControllers --> deleteHistory --> error", error);
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
  deleteHistory,
};
