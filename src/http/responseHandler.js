/**
 * HTTP Response Handler
 * Maps business logic results to HTTP responses
 */

const ErrorTypes = require('../constants/errorTypes');

/**
 * Map error types to HTTP status codes
 */
const errorToHttpStatus = {
  [ErrorTypes.MISSING_REQUIRED_FIELDS]: 400,
  [ErrorTypes.INVALID_ROOM_ID]: 400,
  [ErrorTypes.INVALID_DATE_FORMAT]: 400,
  [ErrorTypes.INVALID_TIME_ORDER]: 400,
  [ErrorTypes.BOOKING_IN_PAST]: 400,
  [ErrorTypes.BOOKING_OVERLAP]: 409,
  [ErrorTypes.INVALID_BOOKING_ID]: 400,
  [ErrorTypes.BOOKING_NOT_FOUND]: 404,
};

/**
 * Send a validation error response
 */
function sendValidationError(res, validationResult) {
  const status = errorToHttpStatus[validationResult.errorType] || 400;
  const response = { error: validationResult.error };
  
  // Include additional data if present (e.g., conflicting booking)
  if (validationResult.data) {
    Object.assign(response, validationResult.data);
  }
  
  return res.status(status).json(response);
}

/**
 * Send a success response
 */
function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json(data);
}

/**
 * Send a created response
 */
function sendCreated(res, data) {
  return sendSuccess(res, data, 201);
}

/**
 * Send an error response by error type
 */
function sendError(res, errorType, message, additionalData = null) {
  const status = errorToHttpStatus[errorType] || 500;
  const response = { error: message };
  
  if (additionalData) {
    Object.assign(response, additionalData);
  }
  
  return res.status(status).json(response);
}

module.exports = {
  sendValidationError,
  sendSuccess,
  sendCreated,
  sendError,
  errorToHttpStatus,
};
