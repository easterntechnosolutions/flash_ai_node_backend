// MODELS
const { History, Chat, Chat_Reply, sequelize } = require("../models");

// CORE CONFIG
const logger = require("../core-configurations/logger-config/loggers");

// UTILS
const { successResponse, errorResponse } = require("../utils/handleResponses");
const message = require("../utils/commonMessages");

// FUNCTION TO GET ALL LIST OF HISTORY
const getAllHistory = async (req, res) => {
  try {
    logger.info("historyControllers --> getAllHistory --> reached");

    const { page = 1, pageSize = 5 } = req.query;
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize, 10);

    const { count, rows } = await History.findAndCountAll({
      offset,
      limit,
    });

    let responseData = {
      histories: rows,
      total: count,
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

const getManualTextHistoryById = async (req, res) => {
  try {
    logger.info("historyControllers --> getManualTextHistoryById --> reached");

    const { id } = req.params;

    // Manually perform an INNER JOIN between Chat and Chat_Reply using raw SQL
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

    chatData.forEach((row) => {
      chats.push({
        message: row.message,
        me: row.me,
        sequence: row.sequence,
      });

      chatReplies.push({
        reply: row.reply,
      });
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

// FUNCTION TO DELETE HISTORY BY ID
const deleteHistory = async (req, res) => {
  try {
    logger.info("historyControllers --> deleteHistory --> reached");

    const { id } = req.params;

    const history = await History.findByPk(id);
    if (!history) {
      return errorResponse(res, message.COMMON.NOT_FOUND, null, 404);
    }

    await history.destroy();

    logger.info("historyControllers --> deleteHistory --> ended");
    return successResponse(res, message.COMMON.DELETE_SUCCESS, history, 200);
  } catch (error) {
    logger.error("historyControllers --> deleteHistory --> error", error);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

module.exports = { getAllHistory, getManualTextHistoryById, deleteHistory };
