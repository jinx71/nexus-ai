/**
 * Centralized response helpers so every route returns the same envelope:
 *   success -> { success: true, data, message }
 *   failure -> { success: false, message, errors }
 *
 * NOTE: streaming (SSE) AI routes do NOT use this — they speak text/event-stream.
 * Everything else (auth, usage) funnels through here.
 */
const ok = (res, data = null, message = '', status = 200) =>
  res.status(status).json({ success: true, data, message });

const fail = (res, message = 'Something went wrong', status = 400, errors = []) =>
  res.status(status).json({ success: false, message, errors });

module.exports = { ok, fail };
