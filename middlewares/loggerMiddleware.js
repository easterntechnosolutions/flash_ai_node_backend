const logger = require("../core-configurations/logger-config/loggers");

const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  logger.info("====================START=====================");
  logger.info(
    `Request Method --> ${req.method} ::: at Path --> ${req.originalUrl}`
  );

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      `Request Method --> ${req.method} ::: at Path --> ${req.originalUrl} ::: status code --> ${res.statusCode} in ${duration}ms`
    );
    logger.info("====================END=====================");
  });

  next();
};

module.exports = loggerMiddleware;
