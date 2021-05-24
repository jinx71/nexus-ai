import { useCallback, useRef, useState } from 'react';
import { API_URL, TOKEN_KEY } from '../api/client';

/**
 * useStream — consume the backend's Server-Sent Events stream token-by-token.
 *
 * Why fetch + ReadableStream instead of EventSource?
 *   EventSource can't send an Authorization header, and these routes are
 *   protected. fetch lets us attach the Bearer token AND gives us a readable
 *   body we can decode incrementally. AbortController gives us a real cancel.
 *
 * Returns: { output, isStreaming, error, done, start, stop, reset }
 */
export const useStream = () => {
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const controllerRef = useRef(null);

  const reset = useCallback(() => {
    setOutput('');
    setError(null);
    setDone(false);
  }, []);

  const stop = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const start = useCallback(async (tool, body) => {
    // Reset state for a fresh run.
    setOutput('');
    setError(null);
    setDone(false);
    setIsStreaming(true);

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${API_URL}/ai/${tool}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      // Non-streaming failures (validation, auth, rate limit) come back as JSON.
      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
          const data = await res.json();
          message = data.message || message;
        } catch (e) {
          /* not JSON */
        }
        throw new Error(message);
      }

      if (!res.body) {
        throw new Error('Streaming is not supported by this browser.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let streamError = null;

      // Read chunks until the stream closes.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const { value, done: readerDone } = await reader.read();
        if (readerDone) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by a blank line.
        const frames = buffer.split('\n\n');
        buffer = frames.pop() || '';

        for (const frame of frames) {
          const line = frame.trim();
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') {
            continue;
          }
          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) {
              streamError = parsed.error;
            } else if (typeof parsed.token === 'string') {
              setOutput((prev) => prev + parsed.token);
            }
          } catch (e) {
            // partial frame across chunk boundary — ignore
          }
        }
      }

      if (streamError) {
        setError(streamError);
      } else {
        setDone(true);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Stream failed');
      }
    } finally {
      controllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  return { output, isStreaming, error, done, start, stop, reset };
};
