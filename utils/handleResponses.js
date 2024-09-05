const successResponse = (res, message, data, statusCode) => {
  res.status(statusCode).json({
    statusType: true,
    message,
    data,
  });
};

const errorResponse = (res, message, data, statusCode) => {
  res.status(statusCode).json({
    statusType: false,
    message,
    data,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
