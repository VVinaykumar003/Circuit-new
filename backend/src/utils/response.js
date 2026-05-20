/**
 * Sends a standardized success JSON response.
 * 
 * @param {Object} res - The Express response object.
 * @param {string} message - The success message to return.
 * @param {Object|Array|null} [data=null] - The data payload to return.
 * @param {number} [statusCode=200] - The HTTP status code (default is 200).
 * @returns {Object} The Express JSON response.
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
  };

  // Only attach the data property if it's provided
  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const errorResponse = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};