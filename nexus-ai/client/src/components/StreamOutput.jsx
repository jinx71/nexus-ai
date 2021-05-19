import React, { useState } from 'react';
import Spinner from './Spinner';
import Badge from './Badge';
import { CopyIcon, CheckIcon } from './icons';
import { cx } from '../utils/format';

/**
 * The app's signature element: text that appears token-by-token with a blinking
 * caret while streaming. Renders the four async states the portfolio requires —
 * idle/empty, loading (first token pending), streaming/done, and error.
 */
const StreamOutput = ({ output, isStreaming, error, done }) => {
  const [copied, setCopied] = useState(false);

  const hasText = output && output.length > 0;
  const waitingForFirstToken = isStreaming && !hasText && !error;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      /* clipboard blocked — no-op */
    }
  };

  const words = hasText ? output.trim().split(/\s+/).length : 0;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-ink-100 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink-800">Output</span>
          {isStreaming && <Badge tone="brand">streaming…</Badge>}
          {done && !isStreaming && hasText && <Badge tone="success">done</Badge>}
          {error && <Badge tone="warn">error</Badge>}
        </div>
        {hasText && (
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-ink-400 sm:inline">
              {words.toLocaleString()} words · {output.length.toLocaleString()} chars
            </span>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-ink-600 transition hover:bg-ink-100"
              disabled={isStreaming}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">The stream stopped.</p>
            <p className="mt-1 text-red-600">{error}</p>
          </div>
        )}

        {/* Loading state — first token not in yet */}
        {waitingForFirstToken && (
          <div className="flex items-center gap-3 text-sm text-ink-500">
            <Spinner size="sm" />
            Warming up the model…
          </div>
        )}

        {/* Streaming / done */}
        {hasText && (
          <p
            className={cx(
              'whitespace-pre-wrap text-[15px] leading-relaxed text-ink-800',
              'animate-fade-up'
            )}
          >
            {output}
            {isStreaming && <span className="stream-caret" aria-hidden="true" />}
          </p>
        )}

        {/* Idle / empty */}
        {!error && !isStreaming && !hasText && (
          <div className="flex h-full min-h-[180px] flex-col items-center justify-center text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-xl">
              <span aria-hidden="true">✦</span>
            </div>
            <p className="text-sm font-medium text-ink-700">Output will stream here</p>
            <p className="mt-1 max-w-xs text-xs text-ink-400">
              Enter some text and run the tool — the response appears word by word as it is generated.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamOutput;
