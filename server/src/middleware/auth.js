const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { fail } = require('../utils/apiResponse');

/**
 * Verify a Bearer token and attach the user to req.user.
 *
 * Accepts the token from the Authorization header (normal REST calls) OR from a
 * `token` query param. The query-param path exists ONLY because the streaming
 * route can also be consumed by an EventSource, which cannot set custom headers.
 * Our React client uses fetch + Authorization header, but we keep the fallback.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;

  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return fail(res, 'Not authorized — no token provided', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change_me');
    const user = await User.findById(decoded.id);
    if (!user) {
      return fail(res, 'Not authorized — user no longer exists', 401);
    }
    req.user = user;
    return next();
  } catch (err) {
    return fail(res, 'Not authorized — invalid or expired token', 401);
  }
});

module.exports = { protect };
