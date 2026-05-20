/**
 * Wraps async route handlers to catch errors and pass them to the Express error handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global Error Handler Middleware
 * Should be added to your app.js / server.js as the very last middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  asyncHandler,
  errorHandler,
};
