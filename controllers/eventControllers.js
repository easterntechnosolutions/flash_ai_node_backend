const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

// CORE-CONFIG MODULES
const logger = require("../core-configurations/logger-config/loggers");

// MODELS
const { Event } = require("../models");

// UTILS MODULES
const message = require("../utils/commonMessages");
const { successResponse, errorResponse } = require("../utils/handleResponses");

// Determine the environment (default to 'development')
const environment = process.env.NODE_ENV || "development";

// Load the appropriate .env file
dotenv.config({ path: `.env.${environment}` });

// FUNCTION FOR CREATE A NEW EVENTS
const createNewEvents = async (req, res) => {
  try {
    logger.info("eventControllers --> createNewEvents --> reached");
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    const { name, description, date, time, location, image } = req.body;

    // Create a new event using the Event model
    const response = await Event.create({
      name,
      description,
      date,
      time,
      location,
      image,
      user_id: userId,
    });

    logger.info("eventControllers --> createNewEvents --> ended");
    return successResponse(res, message.COMMON.CREATE_SUCCESS, response, 201);
  } catch (error) {
    logger.error(`Error in create a new events: ${error.message}`);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

// FUNCTION FOR GET ALL LIST OF EVENTS
const getAllEvents = async (req, res) => {
  try {
    logger.info("eventControllers --> getAllEvents --> reached");

    const { page = 1, pageSize = 10 } = req.query;
    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;

    // Fetch the total number of events
    const totalRecords = await Event.count();

    // Fetch the events using limit and offset for pagination
    const finalResponse = await Event.findAll({
      limit,
      offset,
    });

    // Prepare the paginated response
    const eventsData = {
      events: finalResponse,
      total: totalRecords,
      page: parseInt(page, 10),
      pageSize: limit,
    };

    logger.info("eventControllers --> getAllEvents --> ended");
    return successResponse(
      res,
      message.COMMON.LIST_FETCH_SUCCESS,
      eventsData,
      200
    );
  } catch (error) {
    logger.error(`Error in get all events: ${error.message}`);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

// FUNCTION FOR GET EVENT BY ID
const getEventById = async (req, res) => {
  try {
    logger.info("eventControllers --> getEventById --> reached");

    const { id } = req.params;

    // Find the event by its primary key (ID)
    const event = await Event.findByPk(id);

    // If event not found, return a 404 response
    if (!event) {
      logger.warn(`Event with ID ${id} not found.`);
      return errorResponse(res, message.COMMON.NOT_FOUND, null, 404);
    }

    logger.info("eventControllers --> getEventById --> ended");
    return successResponse(res, message.COMMON.FETCH_SUCCESS, event, 200);
  } catch (error) {
    logger.error(`Error in get event by id: ${error.message}`);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

// FUNCTION FOR GET EVENTS BY USER ID
const getEventByUserId = async (req, res) => {
  try {
    logger.info("eventControllers --> getEventByUserId --> reached");

    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    // Find the event by its primary key (ID)
    const events = await Event.findAll({ where: { user_id: userId } });

    // If no events found for the user, return a 404 response
    if (events.length === 0) {
      logger.warn(`No events found for userId ${userId}.`);
      return errorResponse(res, message.COMMON.NOT_FOUND, null, 404);
    }

    logger.info("eventControllers --> getEventByUserId --> ended");
    return successResponse(res, message.COMMON.FETCH_SUCCESS, events, 200);
  } catch (error) {
    logger.error(`Error in get event by user id: ${error.message}`);
    return errorResponse(
      res,
      message.SERVER.INTERNAL_SERVER_ERROR,
      error.message,
      500
    );
  }
};

module.exports = {
  createNewEvents,
  getAllEvents,
  getEventById,
  getEventByUserId,
};
