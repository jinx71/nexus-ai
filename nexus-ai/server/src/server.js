require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const usageRoutes = require('./routes/usageRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & infra middleware ────────────────────────────────────────────
// crossOriginResourcePolicy is relaxed so the SSE stream isn't blocked when the
// client is served from a different origin (CRA dev server on :3000).
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({ origin: allowedOrigin, credentials: true }));

app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Global rate limiter (per IP). The AI routes layer a stricter one on top.
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, try again shortly.', errors: [] },
  })
);

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ success: true, data: { status: 'ok', uptime: process.uptime() }, message: 'Nexus AI API' })
);

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/usage', usageRoutes);

// ── 404 + error handling (must be last) ────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Boot ───────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Nexus AI server running on http://localhost:${PORT}`);
  });
};

start();

module.exports = app;
