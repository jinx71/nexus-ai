const express = require('express');
const { summary } = require('../controllers/usageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, summary);

module.exports = router;
