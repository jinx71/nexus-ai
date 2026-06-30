const axios = require('axios');

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE ENGINEERING LESSON FOR NEXUS AI: streaming LLM responses through Express.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  The provider (Groq / OpenAI / Together / any OpenAI-compatible endpoint)
 *  streams Server-Sent Events: a series of `data: {json}\n\n` chunks, ending
 *  with `data: [DONE]\n\n`. We:
 *    1. Open the upstream request with axios `responseType: 'stream'` so the
 *       Node response body is a Readable we can consume chunk-by-chunk.
 *    2. Re-buffer partial lines (a network chunk can split a JSON frame in half).
 *    3. Pull the incremental token out of `choices[0].delta.content`.
 *    4. Hand each token to the caller via `onToken`, accumulate the full text,
 *       and call `onDone(fullText, ms)` exactly once at the end.
 *
 *  The API key lives ONLY here, server-side. The browser never sees it — it only
 *  talks to our own /api/ai/:tool route, which re-emits these tokens as its own
 *  SSE stream. That re-emission is the proxy.
 *
 *  PERIOD NOTE: this is the single app in the 12-app portfolio that uses a
 *  post-2022 third-party API. Everything *around* it (Express 4.18, Mongoose 6,
 *  axios 0.27, React 17) stays period-accurate. The streaming technique itself
 *  (SSE + chunked transfer) is classic and works fine on Node 16.
 *
 *  NO-KEY FALLBACK: if AI_API_KEY is unset, we stream a canned, tool-aware
 *  response word-by-word with small delays so the whole UX — typing cursor,
 *  cancel button, usage metering — works end to end with zero signup.
 */

const BASE_URL = process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1';
const MODEL = process.env.AI_MODEL || 'llama-3.1-8b-instant';
const API_KEY = process.env.AI_API_KEY || '';

const hasKey = () => Boolean(API_KEY);

/**
 * Build a short, plausible mock answer so the demo is coherent without a key.
 */
const buildMockText = (messages) => {
  const userMsg = [...messages].reverse().find((m) => m.role === 'user');
  const content = (userMsg && userMsg.content) || '';
  const match = content.match(/"""([\s\S]*?)"""/);
  const sample = (match ? match[1] : content).trim().replace(/\s+/g, ' ');
  const preview = sample.length > 160 ? `${sample.slice(0, 160)}…` : sample;

  return (
    'Demo mode is on, so this response is generated locally without calling a ' +
    'language model. Add an AI_API_KEY in server/.env (Groq has a free tier) to ' +
    'stream real completions. Here is a placeholder based on your input: ' +
    (preview ? `"${preview}" ` : '') +
    'The streaming pipeline, cancel button, and usage metering are all live — only ' +
    'the words are canned. Swap in a key and the exact same UI streams real tokens.'
  );
};

/**
 * Stream a canned response token-by-token to mimic real latency.
 */
const streamMock = async ({ messages, onToken, onDone }) => {
  const started = Date.now();
  const words = buildMockText(messages).split(' ');
  let full = '';
  for (let i = 0; i < words.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 25 + Math.random() * 45));
    const piece = (i === 0 ? '' : ' ') + words[i];
    full += piece;
    onToken(piece);
  }
  onDone(full, Date.now() - started);
};

/**
 * Stream a real completion from the OpenAI-compatible provider.
 */
const streamProvider = async ({ messages, onToken, onDone, onError }) => {
  const started = Date.now();
  let full = '';
  let finished = false;

  const done = () => {
    if (finished) return;
    finished = true;
    onDone(full, Date.now() - started);
  };

  try {
    const response = await axios({
      method: 'post',
      url: `${BASE_URL}/chat/completions`,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: {
        model: MODEL,
        messages,
        stream: true,
        temperature: 0.7,
      },
      responseType: 'stream',
      timeout: 60000,
    });

    let buffer = '';

    response.data.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\n');
      // keep the last (possibly partial) line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') {
          done();
          return;
        }
        try {
          const json = JSON.parse(payload);
          const token = json.choices?.[0]?.delta?.content || '';
          if (token) {
            full += token;
            onToken(token);
          }
        } catch (e) {
          // partial JSON across chunk boundary — ignore, it will complete later
        }
      }
    });

    response.data.on('end', done);
    response.data.on('error', (err) => onError(err));
  } catch (err) {
    // Surface a useful message from the provider when possible.
    let message = err.message;
    if (err.response && err.response.data) {
      try {
        // error body also arrives as a stream when responseType is stream
        const chunks = [];
        await new Promise((resolve) => {
          err.response.data.on('data', (c) => chunks.push(c));
          err.response.data.on('end', resolve);
          err.response.data.on('error', resolve);
        });
        const body = Buffer.concat(chunks).toString('utf8');
        const parsed = JSON.parse(body);
        message = parsed?.error?.message || message;
      } catch (e) {
        // keep original message
      }
    }
    onError(new Error(message));
  }
};

/**
 * Public entry point. Routes to the provider or the mock based on key presence.
 * Always resolves (never rejects) — errors are delivered through onError so the
 * SSE controller can emit them without unhandled rejections.
 */
const streamCompletion = async ({ messages, onToken, onDone, onError }) => {
  const safeToken = (t) => {
    try {
      onToken(t);
    } catch (e) {
      /* client disconnected */
    }
  };

  if (!hasKey()) {
    return streamMock({ messages, onToken: safeToken, onDone, onError });
  }
  return streamProvider({ messages, onToken: safeToken, onDone, onError });
};

module.exports = { streamCompletion, hasKey, MODEL };
