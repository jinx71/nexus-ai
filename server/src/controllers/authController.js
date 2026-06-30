const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'change_me', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return fail(res, 'Validation failed', 422, result.array());
  }

  const { name, email, password } = req.body;

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return fail(res, 'That email is already registered', 409);
  }

  // NOTE: role is never read from the request body — these apps don't accept
  // privilege from the client. (Nexus AI has no roles, but the convention holds.)
  const user = await User.create({ name, email, password });
  const token = signToken(user._id);

  return ok(res, { token, user: publicUser(user) }, 'Account created', 201);
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return fail(res, 'Validation failed', 422, result.array());
  }

  const { email, password } = req.body;

  // password has select:false, so explicitly request it for comparison
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return fail(res, 'Invalid email or password', 401);
  }

  const token = signToken(user._id);
  return ok(res, { token, user: publicUser(user) }, 'Signed in');
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => ok(res, { user: publicUser(req.user) }));

module.exports = { register, login, me };
