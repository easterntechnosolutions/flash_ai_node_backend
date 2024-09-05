// MODELS
const { History, sequelize } = require("../models");

// CORE CONFIG
const logger = require("../core-configurations/logger-config/loggers");

// UTILS
const { successResponse, errorResponse } = require("../utils/handleResponses");
const message = require("../utils/commonMessages");

// FUNCTION TO CREATE HISTORY
const createHistory = async (req, res) => {
  try {
    logger.info("historyControllers --> createHistory --> reached");

    const { history, email } = req.body;

    const result = await History.create({
      history,
      email,
    });

    logger.info("historyControllers --> createHistory --> ended");
    return successResponse(res, message.COMMON.CREATE_SUCCESS, result, 201);
  } catch (error) {
    logger.error("historyControllers --> createHistory --> error", error);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

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

module.exports = { createHistory, getAllHistory, deleteHistory };
