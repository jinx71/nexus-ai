/**
 * Wrap async route handlers so rejected promises are forwarded to Express's
 * error-handling middleware instead of crashing the process.
 *
 * For streaming routes we still wrap, but the controller catches its own errors
 * and emits them over SSE (headers are already sent, so the error middleware
 * checks res.headersSent before trying to respond).
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
