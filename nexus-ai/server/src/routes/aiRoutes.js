const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { stream, status } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * A tighter limiter specifically for the (relatively expensive) AI routes,
 * on top of the global limiter in server.js. Generous enough for a portfolio
 * demo, strict enough to stop a runaway loop from burning a free-tier quota.
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many AI requests — slow down a moment.', errors: [] },
});

const inputRules = [
  body('input')
    .isString()
    .withMessage('Input must be text')
    .bail()
    .trim()
    .isLength({ min: 1, max: 8000 })
    .withMessage('Input must be 1–8000 characters'),
  body('options').optional().isObject().withMessage('Options must be an object'),
];

router.get('/status', status);
router.post('/:tool', protect, aiLimiter, inputRules, stream);

module.exports = router;
