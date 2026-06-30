const { validationResult } = require('express-validator');
const { streamCompletion, hasKey, MODEL } = require('../services/aiService');
const { buildPrompt } = require('../services/prompts');
const Usage = require('../models/Usage');
const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');

const VALID_TOOLS = ['summarize', 'paraphrase', 'generate'];

// GET /api/ai/status  -> is a real key configured, and which model
const status = asyncHandler(async (req, res) =>
  ok(res, { live: hasKey(), model: hasKey() ? MODEL : 'demo (no key)' })
);

/**
 * POST /api/ai/:tool   (SSE)
 *
 * Streams the model's output back to the browser as Server-Sent Events:
 *   data: {"token":"..."}\n\n   (repeated)
 *   data: [DONE]\n\n            (terminal)
 * or, on failure mid-stream:
 *   data: {"error":"..."}\n\n
 *
 * We do NOT use the {success,data,message} envelope here — that's for JSON
 * routes. SSE has its own framing. Validation failures BEFORE the stream opens
 * still return normal JSON, because no SSE headers have been sent yet.
 */
const stream = asyncHandler(async (req, res) => {
  const { tool } = req.params;
  if (!VALID_TOOLS.includes(tool)) {
    return fail(res, `Unknown tool "${tool}"`, 404);
  }

  const result = validationResult(req);
  if (!result.isEmpty()) {
    return fail(res, 'Validation failed', 422, result.array());
  }

  const { input, options = {} } = req.body;

  let messages;
  try {
    const { system, user } = buildPrompt(tool, input, options);
    messages = [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ];
  } catch (err) {
    return fail(res, err.message, 400);
  }

  // Open the SSE stream.
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // disable proxy buffering (nginx) so tokens flush
  });
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  // If the client navigates away / hits cancel, the request closes. We can't
  // abort the upstream axios stream cleanly from here without extra plumbing,
  // but we stop writing and avoid recording a partial as if it completed.
  let aborted = false;
  req.on('close', () => {
    aborted = true;
  });

  await streamCompletion({
    messages,
    onToken: (token) => {
      if (!aborted) send({ token });
    },
    onDone: async (full, ms) => {
      if (aborted) {
        return res.end();
      }
      // Record usage only for completed requests.
      try {
        await Usage.create({
          user: req.user._id,
          tool,
          model: hasKey() ? MODEL : 'demo',
          inputChars: String(input || '').length,
          outputChars: full.length,
          ms,
        });
      } catch (e) {
        // metering must never break the user-facing stream
        // eslint-disable-next-line no-console
        console.error('Usage record failed:', e.message);
      }
      res.write('data: [DONE]\n\n');
      return res.end();
    },
    onError: (err) => {
      if (!aborted) send({ error: err.message || 'Stream failed' });
      res.end();
    },
  });

  return undefined;
});

module.exports = { stream, status };
