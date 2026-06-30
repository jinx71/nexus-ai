/* eslint-disable no-unused-vars */

/**
 * Centralized error handler. Translates common Mongoose errors into clean
 * messages and always returns the standard failure envelope.
 *
 * SSE-AWARE: once a streaming response has started, headers are already sent and
 * we cannot send a JSON body. In that case we just end the response — the stream
 * controller is responsible for emitting an error frame before things get here.
 */
const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);

  if (res.headersSent) {
    return res.end();
  }

  let status = err.statusCode || 500;
  let message = err.message || 'Server error';
  let errors = [];

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for ${err.path}`;
  }

  // Mongoose validation
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  // Duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `That ${field} is already in use`;
  }

  return res.status(status).json({ success: false, message, errors });
};

module.exports = errorHandler;
