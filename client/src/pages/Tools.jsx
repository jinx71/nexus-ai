import React, { useEffect, useState } from 'react';
import ToolCard from '../components/ToolCard';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import { BoltIcon } from '../components/icons';
import { TOOL_LIST } from '../utils/tools';
import { getAiStatus } from '../api/usage';

const Tools = () => {
  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const s = await getAiStatus();
        if (active) setStatus(s);
      } catch (e) {
        if (active) setStatus(null);
      } finally {
        if (active) setLoadingStatus(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="container-page py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink-900">Tools</h1>
          <p className="mt-1 text-ink-500">Pick a tool and watch it stream the answer in real time.</p>
        </div>
        <div>
          {loadingStatus ? (
            <span className="inline-flex items-center gap-2 text-sm text-ink-400">
              <Spinner size="sm" /> checking provider…
            </span>
          ) : status?.live ? (
            <Badge tone="success">
              <BoltIcon className="h-3.5 w-3.5" /> Live · {status.model}
            </Badge>
          ) : (
            <Badge tone="warn">Demo mode · no API key</Badge>
          )}
        </div>
      </div>

      {!loadingStatus && !status?.live && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Running in demo mode — responses are generated locally and streamed token-by-token. Add an{' '}
          <code className="rounded bg-amber-100 px-1 py-0.5">AI_API_KEY</code> in{' '}
          <code className="rounded bg-amber-100 px-1 py-0.5">server/.env</code> to stream real
          completions. Everything else works identically.
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TOOL_LIST.map((tool) => (
          <ToolCard key={tool.key} tool={tool} />
        ))}
      </div>
    </div>
  );
};

export default Tools;
